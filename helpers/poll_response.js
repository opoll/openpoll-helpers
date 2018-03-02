
// Imports
var crypto = require('crypto');
var schemaValidator = require('jsonschema').validate;

// Create the library
var lib = {};

// Path to a block schema
lib.BLOCK_SCHEMA_PATH = "/poll/response";
lib.BLOCK_SCHEMA = require( "../schemas/0.1" + lib.BLOCK_SCHEMA_PATH + ".json" );

/*
  Given a main chain block, this function will return true if the input
  conforms to schema and false if the schema is invalid
*/
lib.validateSchema = function( obj ) {
  return schemaValidator( obj, lib.BLOCK_SCHEMA );
}

/*
  This function produces a hash representing this poll response
  A poll response includes the following fields:
    * pollHash
    * timestamp
    * respondentAddr
    * rewardAddr
    * signature
    * respondeData
    * respondentDemographics
*/
lib.computeResponseHash = function( pollResponseObj, digestType = "hex" ) {
  // Create HMAC with basic block information
  var hmac = crypto.createHmac( 'sha256', '' )
            .update( pollResponseObj.pollHash )
            .update( pollResponseObj.timestamp.toString() )
            .update( pollResponseObj.respondentAddr )
            .update( pollResponseObj.rewardAddr )
            .update( pollResponseObj.signature );

  // Update the HMAC with poll response data
  pollResponseObj.responseData.forEach( function( responseStr ) {
    hmac = hmac.update( responseStr );
  } );

  // Update the HMAC with deomgraphic information
  pollResponseObj.respondentDemographics.forEach( function( demographicObj ) {
    // TODO: Incorporate the demographic information into the hash
  } );

  // Grab a hex digest and return
  return hmac.digest( digestType );
}

// Export the library
module.exports = lib;
