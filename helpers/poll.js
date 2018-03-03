
// Imports
var crypto = require('crypto');
var NodeRSA = require('node-rsa');
var schemaValidator = require('jsonschema').validate;
var helper_generic = require('./blockchain_generic');

// Create the library
var lib = {};

// Path to a block schema
lib.POLL_SCHEMA_PATH = "/poll/poll";
lib.POLL_SCHEMA = require( "../schemas/" + helper_generic.SCHEMA_VERSION + lib.POLL_SCHEMA_PATH + ".json" );

// Percentage dedicated to the network
lib.NETWORK_FUND_PERCENT = 0.15;

// Returns if a poll is expired
lib.isExpired = function( poll ) {
  return (poll.expiry < (new Date() / 1000));
}

// Returns the funding distribution of the poll
lib.getFundingDistribution = function( poll ) {
  var networkPartition = poll.totalFunding * lib.NETWORK_FUND_PERCENT;
  var respondentPartition = poll.totalFunding - networkPartition;

  return {
    "respondent": {
      "_total": respondentPartition,
      "individual": (respondentPartition / poll.maxRespondents)
    },
    "network": {
      "_total": networkPartition,
      "shard": networkPartition * 0.75,
      "mcif": networkPartition * 0.25
    }
  };
}

/*
  Returns a hash identifier of a poll including the following fields:
    1) timestamp
    2) expiry
    3) totalFunding
    4) maxRespondents
    5) imageId
    6) questions
*/
lib.hash = function( poll, digestType = 'hex' ) {
  // Create HMAC with trivial fields
  var hmac = crypto.createHmac( 'sha256', '' )
                    .update( poll.timestamp.toString() )
                    .update( poll.expiry.toString() )
                    .update( poll.totalFunding.toString() )
                    .update( poll.maxRespondents.toString() )
                    .update( poll.imageId.toString() );

  // Loop through all questions in the poll and include them
  poll.questions.forEach( function( questionText ) {
    hmac = hmac.update( questionText );
  } );

  // Update the hash on the poll object
  poll.hash = hmac.digest( digestType );

  // Return the hash
  return poll.hash;
}

// Export the library
module.exports = lib;
