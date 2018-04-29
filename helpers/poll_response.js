
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate, validator } = require("@openpoll/schemas");

// Create the library
var lib = {};

// Path to a block schema
lib.BLOCK_SCHEMA = schemas[helper_generic.SCHEMA_VERSION].poll.response;

/*
  Given a main chain block, this function will return true if the input
  conforms to schema and false if the schema is invalid
*/
lib.validateSchema = function( obj ) {
  return validate(lib.BLOCK_SCHEMA, obj);
}

/*
  Validate the response based on the poll it is supposedly responding to
*/
lib.validateAnswers = function (poll, response) {
  if (!validate(schemas[helper_generic.SCHEMA_VERSION].poll.poll, poll)) {
    // Invalid poll format
    return false;
  }

  if (!lib.validateSchema(response)) {
    // Invalid response format
    return false;
  }

  // Check if the amount of responses equal the amount of questions
  if (poll.questions.length !== response.answers.length) {
    return false;
  }

  // Validate response against poll
  for (let i = 0; i < poll.questions.length; i++) {
    let question = poll.questions[i];

    // Check if the answers for each question match the question's possible answers
    switch (question.questionType) {
      case "boolean":
        if (typeof response.answers[i] !== "boolean") {
          return false;
        }
      break;
      case "selectOne":
        if (typeof response.answers[i] !== "string") {
          return false;
        }

        if (question.options.find((option) => {
          return option.key === response.answers[i];
        }) === undefined) {
          // Given answer not in the possible answers list
          return false;
        }
      break;
      case "selectAny":
      case "selectMax":
        if (!Array.isArray(response.answers[i])) {
          return false;
        }

        for (let j = 0; j < response.answers[i].length; j++) {
          if (typeof response.answers[i][j] !== "string") {
            return false;
          }

          if (question.options.find((option) => {
            return option.key === response.answers[i][j];
          }) === undefined) {
            // Given answer not in the possible answers list
            return false;
          }
        }
      break;
    }

    if (question.questionType === "selectMax" && response.answers[i].length > question.maxSelected) {
      // User selected more responses than allowed
      return false;
    }
  }

  return true;
}

/*
  Returns fields which are baked into the hash
*/
lib.bakedFields = function( pollResponseObj ) {
  return {
    hash: pollResponseObj.hash,
    fields: {
      pollHash: pollResponseObj.pollHash,
      timestamp: pollResponseObj.timestamp,
      respondentAddress: pollResponseObj.respondentAddress,
      rewardAddress: pollResponseObj.rewardAddress,
      answers: pollResponseObj.answers,
      respondentDemographics: pollResponseObj.respondentDemographics
    }
  }
}

/*
  This function produces a hash representing this poll response
  A poll response includes the following fields:
    * hash
    * timestamp
    * respondentAddress
    * rewardAddress
    * answers
    * respondentDemographics
*/
lib.orderedHashFields = function( o ) {
  var arr = [
    o.pollHash,
    o.timestamp.toString(),
    o.respondentAddress,
    o.rewardAddress || ""
  ];

  // Include response data
  o.answers.forEach(( answer ) => {
    if (Array.isArray(answer)) {
      answer.forEach((value) => {
        arr.push(value);
      });
    } else {
      arr.push(answer.toString());
    }
  });

  // Include demographic information (sort alphabetically by key)
  Object.keys(o.respondentDemographics).sort().forEach((demographic) => {
    // arr.push(demographic);
    // arr.push(o.respondentDemographics[demographic]);
  });

  return arr;
}

/*
  Returns a hash identifier of a poll
*/
lib.hash = function( o, digestType = "hex" ) {
  // Update the hash on the poll object
  o.hash = helper_generic.hashFromOrderedFields( lib.orderedHashFields( o ), digestType );

  // Return the hash
  return o.hash;
}

/*
  Given an array of poll responses, this function produces a hash to
  represet the ordered set of responses
*/
lib.hashResponses = function( pollResponseArr, digestType = "hex" ) {
  // Create HMAC with basic block information
  var hmac = crypto.createHash( 'sha256' );

  // Loop through all provided poll responses
  pollResponseArr.forEach( function( pollObj ) {
    hmac = hmac.update( lib.hash( pollObj ) );
  } );

  // Grab a hex digest and return
  return hmac.digest( digestType );
}

/*
  This function takes a poll response and validates the signature of the
  response corresponds to the public address. This function requires the
  public key of the respondent.
*/
lib.validateSignature = function( pollResponseObj, respondentPubKeyData ) {
  // If no public key could be found..
  if( (respondentPubKeyData == undefined) && (pollResponseObj.respondentPublicKey == undefined) ) {
    throw {
      name: "UnknownRespondentPublicKey",
      message: "unable to locate the public key of the respondent"
    };
  }

  // Convert the public key to an address
  var respondentAddress = helper_generic.publicKeyToAddress( respondentPubKeyData || pollResponseObj.respondentPublicKey );

  /*
    Because the signature verification is intrinsically related to the
    response hash, we will force recompute a response hash to ensure integrity
  */
  pollResponseObj.hash = lib.hash( pollResponseObj );

  /*
    To prevent a valid respondent from spoofing a response from another user,
    we ensure the respondentAddr listed in the response object aligns with the
    protected public key.
  */
  if( pollResponseObj.respondentAddress !== respondentAddress ) {
    throw {
      name: "InvalidRespondentAddress",
      message: "the address specified in the response does not correspond to the provided public key"
    };
  }

  /*
    To verify the signature itself we ensure the respondent public key authored the signature
    specified in the response object, and the signature was derived from the response hash.
  */
  const verify = crypto.createVerify("sha256");
  verify.update(pollResponseObj.hash);

  if (!verify.verify(respondentPubKeyData || pollResponseObj.respondentPublicKey, pollResponseObj.signature, "hex")) {
    throw {
      name: "InvalidSignature",
      message: "the signature provided does not match this response or was not authored by the respondent"
    };
  }

  // Success
  return true;
}

/*
  Create a signature for a given response with the provided private key
*/
lib.sign = function( pollResponseObj, privateKeyData, publicKeyData, rewardAddress = undefined ) {
  // Calculate the address
  var respondentAddress = helper_generic.publicKeyToAddress( publicKeyData );

  // Update the poll response object..
  pollResponseObj.respondentPublicKey = publicKeyData.toString();
  pollResponseObj.respondentAddress = respondentAddress;
  pollResponseObj.rewardAddress = rewardAddress || pollResponseObj.rewardAddress;

  // Recompute the response hash
  pollResponseObj.hash = lib.hash( pollResponseObj );

  // Compute a signature
  const sign = crypto.createSign("RSA-SHA256");

  sign.update(pollResponseObj.hash);
  pollResponseObj.signature = sign.sign(privateKeyData, "hex");

  return pollResponseObj;
}

// Export the library
module.exports = lib;
