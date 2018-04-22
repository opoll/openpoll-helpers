
// Imports
var crypto = require('crypto');
var helper_generic = require('./blockchain_generic');
const { schemas, validate, validator } = require("@openpoll/schemas");

// Create the library
var lib = {};

// Path to a transaction schema
lib.TXN_SCHEMA = schemas[helper_generic.SCHEMA_VERSION].token.transaction;

/*
  Given a transaction, this function will return true if the input
  conforms to schema and false if the schema is invalid
*/
lib.validateSchema = function( obj ) {
  return validate(lib.TXN_SCHEMA, obj);
}

/*
  This function produces a hash representing this transaction
  A transaction hash includes the following fields:
    * senderAddress
    * receiverAddress
    * amount
    * timestamp
*/
lib.orderedHashFields = function( txnObj ) {
  var arr = [
    txnObj.senderAddress,
    txnObj.receiverAddress,
    txnObj.amount.toString(),
    txnObj.timestamp.toString()
  ];

  return arr;
}

/*
  Returns a hash identifier of a poll
*/
lib.hash = function( txnObj, digestType = "hex" ) {
  // Update the hash on the transaction
  txnObj.hash = helper_generic.hashFromOrderedFields( lib.orderedHashFields( txnObj ), digestType );

  // Return the hash
  return txnObj.hash;
}

/*
  This function takes a transaction and validates the signature of the
  transaction corresponds to the public address. This function requires the
  public key of the sender.
*/
lib.validateSignature = function( txnObj, senderPubKeyData ) {
  // If no public key could be found..
  if( (senderPubKeyData == undefined) && (txnObj.senderPubKeyData == undefined) ) {
    throw {
      name: "UnknownRespondentPublicKey",
      message: "unable to locate the public key of the sender"
    };
  }

  // Convert the public key to an address
  var senderAddress = helper_generic.publicKeyToAddress( senderPubKeyData || txnObj.senderPubKeyData );

  /*
    Because the signature verification is intrinsically related to the
    transaction, we will force recompute a transaction hash to ensure integrity
  */
  txnObj.hash = lib.hash( txnObj );

  /*
    Validate the sender address based off the public key
  */
  if( txnObj.senderAddress !== senderAddress ) {
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
  verify.update(txnObj.hash);

  if (!verify.verify(senderPubKeyData || txnObj.senderPublicKey, txnObj.signature, "hex")) {
    throw {
      name: "InvalidSignature",
      message: "the signature provided does not match this sender or was not authored by the sender"
    };
  }

  // Success
  return true;
}

/*
  Create a signature for a given transaction with the provided private key
*/
lib.sign = function( txnObj, privateKeyData, publicKeyData ) {
  // Calculate the address
  var senderAddress = helper_generic.publicKeyToAddress( publicKeyData );

  // Update the transaction object..
  txnObj.respondentPublicKey = publicKeyData.toString();
  txnObj.senderAddress = senderAddress;

  // Recompute the transaction hash
  txnObj.hash = lib.hash( txnObj );

  // Compute a signature
  const sign = crypto.createSign("RSA-SHA256");

  sign.update(txnObj.hash);
  txnObj.signature = sign.sign(privateKeyData, "hex");
}

// Export the library
module.exports = lib;
