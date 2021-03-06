
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate } = require("@openpoll/schemas");

// Create the library
var mainchainHelpers = {};

// Path to a block schema
mainchainHelpers.BLOCK_SCHEMA = schemas[helper_generic.SCHEMA_VERSION].mainchain.block;

/*
  Given a main chain block, this function will return true if the input
  conforms to schema and false if the schema is invalid
*/
mainchainHelpers.validateBlockSchema = function( mainChainBlock ) {
  return validate(mainchainHelpers.BLOCK_SCHEMA, mainChainBlock);
}

/*
  Produces a hash for a block on the mainchain
  DO NOT USE THIS FOR MINING, VERY SLOW
*/
mainchainHelpers.computeBlockHash = function( mainChainBlock, digestType = "hex" ) {
  // Create pre-digest hash with basic block information
  var preDigestHash = crypto.createHash( 'sha256' )
            .update( mainChainBlock.blockId.toString() )
            .update( mainChainBlock.timestamp.toString() )
            .update( mainChainBlock.prevHash )
            .update( mainChainBlock.minerAddress )
            .update( mainChainBlock.difficulty.toString() );

  // Update the pre-digest hash with transaction data
  // TODO

  // Update the pre-digest hash with shard data
  // TODO

  // Add the nonce (if it exists)
  if( mainChainBlock.nonce && (mainChainBlock.nonce.toString() != "0") )
    preDigestHash = preDigestHash.update( mainChainBlock.nonce.toString() );

  // Grab a hex digest and return
  return preDigestHash.digest( digestType );
}

// Export the library
module.exports = mainchainHelpers;
