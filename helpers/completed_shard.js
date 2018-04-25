
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate, validator } = require("@openpoll/schemas");

// Create the library
var lib = {};

// Schemas
lib.SCHEMA_COMPLETED_SHARD = schemas[helper_generic.SCHEMA_VERSION].shard.completed;

/*
  This function returns if a completed shard digest conforms to schema
*/
lib.validate = function( obj ) {
  return validate(lib.SCHEMA_COMPLETED_SHARD, obj);
}

module.exports = lib;
