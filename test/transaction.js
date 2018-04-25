
// Imports
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('../')
var tLib = helpers.transaction;
const privateKeyPem = fs.readFileSync("./private.key", { encoding: "utf8" });
const publicKeyPem = fs.readFileSync("./public.key", { encoding: "utf8" });
const validator = require("@openpoll/schemas").validator;

// Some of our factories
var validTransaction = require("./schemas/0.1/validTransactionSimple.json");

describe( 'transaction helper', function() {

  it( 'should reference the /token/transaction schema', function( done ) {
    expect( tLib.TXN_SCHEMA["$id"] ).to.equal( "https://schemas.openpoll.io/0.1/token/transaction.json" );
    done();
  } );

  it( 'should validate a valid transaction', function( done ) {
    var valid = tLib.validateSchema( validTransaction );
    expect( valid ).to.equal(true);
    done();
  } );

  it( 'should not validate a transaction with a missing field', function( done ) {
    var txn = Object.assign( {}, validTransaction );
    txn.senderAddress = undefined;
    var valid = tLib.validateSchema( txn );
    expect( valid ).to.equal(false);
    done();
  } );

  it( 'properly computes the hash of a transaction', function( done ) {
    var txn = Object.assign( {}, validTransaction );
    txn.hash = undefined;
    tLib.hash( txn );
    expect( txn.hash ).to.equal( validTransaction.hash );
    done();
  } );

  describe( 'signature creation', function() {

    it( 'creates a signature', function( ) {
      var txn = Object.assign( {}, validTransaction );
      txn.signature = undefined;
      tLib.sign( txn, privateKeyPem, publicKeyPem );
      expect( txn.signature ).to.exist
    } );

    it( 'creates a valid signature', function( ) {
      var txn = Object.assign( {}, validTransaction );
      txn.signature = undefined;
      tLib.sign( txn, privateKeyPem, publicKeyPem );
      expect( tLib.validateSignature( txn, publicKeyPem ) ).to.be.true
    } );

    it( 'changes signature when data changes', function( ) {
      var txn = Object.assign( {}, validTransaction );
      tLib.sign( txn, privateKeyPem, publicKeyPem );
      var oldSig = txn.signature;
      txn.timestamp = txn.timestamp + 1;
      tLib.sign( txn, privateKeyPem, publicKeyPem );
      expect( txn.signature ).to.not.equal( oldSig );
    } );

    it( 'creates a signature based off the provided private key', function( ) {
      var txn = Object.assign( {}, validTransaction );

      // Create a signature
      tLib.sign( txn, privateKeyPem, publicKeyPem );

      // Validate the signature against the provided public key
      expect( tLib.validateSignature( txn, publicKeyPem ) ).to.be.true
    } );

  } );

} );
