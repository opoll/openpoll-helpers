
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate } = require("@openpoll/schemas");

// Helper Imports
var ShardBlockHelper = require( './shard_block' );

// Create the library
var lib = {};

// Path to a block schema
lib.POLL_SCHEMA = schemas[helper_generic.SCHEMA_VERSION].poll.poll;

// Percentage dedicated to the network
lib.NETWORK_FUND_PERCENT = 0.15;

/*
  Given a main chain block, this function will return true if the input
  conforms to schema and false if the schema is invalid
*/
lib.validateSchema = function( obj ) {
  return validate(lib.POLL_SCHEMA, obj);
}

// Returns if a poll is expired
lib.isExpired = function( poll ) {
  return (poll.expiry < (new Date() / 1000));
}

/*
  Provided a valid poll object, this function will create a corresponding
  genesis /shard/block for this poll. The poll genesis block is deterministic
  based off a /poll/poll object. It does not confirm to schema as schema requires
  there me at least 1 response, however, the genesis block includes 0 responses.
*/
lib.generateGenesisBlock = function( pollObj ) {
  // Hash the poll
  lib.hash( pollObj );

  // Create the genesis block
  var POLL_GENESIS_BLOCK = {
    "blockId": 0,
    "pollHash": pollObj.hash,
    "timestamp": pollObj.timestamp,
    "prevHash": "0".repeat( 64 ),
    "responses": [],
    "minerAddress": "0".repeat( 64 ),
    "nonce": 0
  };

  // Hash the genesis block
  ShardBlockHelper.hash( POLL_GENESIS_BLOCK );

  // Return the genesis block
  return POLL_GENESIS_BLOCK;
}

/*
  Returns the funding distribution of the poll
  | respondent._total = the total POL given to respondents
  | respondent.individual = POL given to an individual respondent
  | network._total = total POL spent on network costs
  | network.shard = total POL spent on all shards
  | network.shard_resp = POL given to miners per response incorporated in a shard block
  | network.mcif = the Main Chain Information Fee
*/
lib.getFundingDistribution = function( poll ) {
  var networkPartition = poll.totalFunding * lib.NETWORK_FUND_PERCENT;
  var respondentPartition = poll.totalFunding - networkPartition;

  return {
    "respondent": {
      "_total": respondentPartition,
      "individual": (respondentPartition / poll.maxResponses)
    },
    "network": {
      "_total": networkPartition,
      "shard": networkPartition * 0.75,
      "shard_resp": (networkPartition * 0.75) / poll.maxResponses,
      "mcif": networkPartition * 0.25
    }
  };
}

/*
  Returns a an array of ordered hash fields which are used in composing
  a hash which represents this poll
    1) timestamp
    2) expiry
    3) totalFunding
    4) maxResponses
    5) imageId
    6) questions
*/
lib.orderedHashFields = function( poll ) {
  var arr = [
    poll.timestamp.toString(),
    poll.title,
    poll.expiry.toString(),
    poll.totalFunding.toString(),
    poll.maxResponses.toString(),
    poll.imageId.toString()
  ];

  // Loop through all questions in the poll and include them
  poll.questions.forEach((question) => {
    arr.push(question.questionType);
    arr.push(question.label);

    if (question.options) {
      question.options.forEach((option) => {
        arr.push(option.key);
        arr.push(option.value);
      });
    }

    if (question.maxSelected) {
      arr.push(question.maxSelected.toString());
    }
  });

  return arr;
}

/*
  Returns a hash identifier of a poll
*/
lib.hash = function( poll, digestType = 'hex' ) {
  // Update the hash on the poll object
  poll.hash = helper_generic.hashFromOrderedFields( lib.orderedHashFields( poll ), digestType );

  // Return the hash
  return poll.hash;
}

// Export the library
module.exports = lib;
