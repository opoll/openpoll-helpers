
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate, validator } = require("@openpoll/schemas");

// Create the library
var lib = {};

// Schemas
lib.SCHEMA_UTXO_CHANGE_DIGEST = schemas[helper_generic.SCHEMA_VERSION].token.utxo_change_digest;

lib.validateChangeDigest = function( changeDigestObject ) {
  return validate(lib.SCHEMA_UTXO_CHANGE_DIGEST, changeDigestObject);
}

module.exports = lib;
