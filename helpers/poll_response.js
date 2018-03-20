
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate } = require("@openpoll/schemas");

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
      responses: pollResponseObj.responseData,
      respondentDemographics: pollResponseObj.respondentDemographics
    }
  }
}

/*
  This function produces a hash representing this poll response
  A poll response includes the following fields:
    * hash
    * timestamp
    * respondentAddr
    * rewardAddr
    * respondeData
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
  o.responseData.forEach( function( responseStr ) {
    arr.push( responseStr );
  } );

  // Include demographic information
  // TODO

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
  Create a signature for a given poll with the provided private key
*/
lib.sign = function( pollResponseObj, privateKeyData, publicKeyData, rewardAddress = undefined ) {
  // Calculate the address
  var respondentAddress = helper_generic.publicKeyToAddress( publicKeyData );

  // Update the poll response object..
  pollResponseObj.respondentPublicKey = publicKeyData;
  pollResponseObj.respondentAddress = respondentAddress;
  pollResponseObj.rewardAddress = rewardAddress || pollResponseObj.rewardAddress;

  // Recompute the response hash
  pollResponseObj.hash = lib.hash( pollResponseObj );

  // Compute a signature
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(pollResponseObj.hash);
  pollResponseObj.signature = sign.sign(privateKeyData, "hex");
}

// Export the library
module.exports = lib;
