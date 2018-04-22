
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate, validator } = require("@openpoll/schemas");

// Create the library
var lib = {};

// Schemas
lib.SCHEMA_UTXO_CHANGE_DIGEST = schemas[helper_generic.SCHEMA_VERSION].token.utxo_change_digest;

/*
  This function returns if a given UTXO Change Digest conforms to schema
*/
lib.validateChangeDigest = function( changeDigestObject ) {
  return validate(lib.SCHEMA_UTXO_CHANGE_DIGEST, changeDigestObject);
}

/*
  Given a UTXO Change Digest, and a method to set a ledger balance, this function
  will update the given ledger based on the UTXO Change Digest.

  -> Ledger Set Function:
      Params: Address - The address to set
              Balance - The balance to set the given address to
*/
lib.applyUTXOChangeDigestToLedger = function( utxoChangeDigest, ledgerSetF ) {
  // Validate the UTXO
  if( !lib.validateChangeDigest( utxoChangeDigest ) ) {
    throw { error: "invalid UTXO change digest provided" };
    return false;
  }

  // Loop through all balances in the UTXO Change Digest
  Object.keys( utxoChangeDigest.balances ).forEach((addr) => {
    ledgerSetF( addr, utxoChangeDigest.balances[addr] );
  });

  return true;
}

module.exports = lib;
