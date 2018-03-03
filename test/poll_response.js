
// Imports
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('../openpoll_helpers')
var tLib = helpers.poll_response;
var NodeRSA = require('node-rsa');

// Some of our factories
var validPollResponse = require('./schemas/0.1/validPollResponse.json');

describe( 'poll response openpoll_helpers', function() {

  it( 'should reference the /poll/response schema', function( done ) {
    expect( tLib.BLOCK_SCHEMA_PATH ).to.equal( "/poll/response" );
    done();
  } );

  it( 'should validate a valid schema', function( done ) {
    expect( tLib.validateSchema( validPollResponse ).errors.length ).to.equal(0);
    done();
  } );

  it( 'does not validate a schema without a poll hash', function( done ) {
      var invalidPollResponse = Object.assign( {}, validPollResponse );
      invalidPollResponse.pollHash = undefined;
      invalidPollResponse.timestamp = undefined;
      invalidPollResponse.respondentAddr = undefined;
      invalidPollResponse.responseData = undefined;
      invalidPollResponse.respondentDemographics = undefined;
      invalidPollResponse.signature = undefined;
      expect( tLib.validateSchema( invalidPollResponse ).errors.length >= 6 ).to.be.true;
      done();
  } );

  it( 'properly computes the hash of a poll response', function( done ) {
    var pollResp = Object.assign( {}, validPollResponse );
    pollResp.responseHash = undefined;
    tLib.hash( pollResp );
    expect( pollResp.responseHash ).to.equal( validPollResponse.responseHash );
    done();
  } );

  describe( 'signature validation', function() {

    it( 'properly validates a valid signature', function( done ) {
      var pollResp = Object.assign( {}, validPollResponse );
      expect( tLib.validateSignature( pollResp ) ).to.be.true
      done();
    } );

    it( 'uses public keys when passed as a parameter', function( done ) {
      var pollResp = Object.assign( {}, validPollResponse );
      var pk = pollResp.respondentPublicKey;
      pollResp.respondentPublicKey = undefined;
      expect( tLib.validateSignature( pollResp, pk ) ).to.be.true
      done();
    } );

    it( 'does not validate a signature when no public key is available', function( done ) {
      var pollResp = Object.assign( {}, validPollResponse );
      pollResp.respondentPublicKey = undefined;
      expect( function () { tLib.validateSignature( pollResp ); } ).to.throw('unable to locate the public key of the respondent');
      done();
    } );

    it( 'does not validate signatures where the respondent address is incorrect', function( done ) {
      var pollResp = Object.assign( {}, validPollResponse );
      pollResp.respondentAddr = "1BfaV1JY7J5kEtJVZrUoCHojkUVK2+YpeBJ/SDsu+fs=";
      expect( function () { tLib.validateSignature( pollResp ); } ).to.throw('the address specified in the response does not correspond to the provided public key');
      done();
    } );

    it( 'does not validate signatures when the signature is incorrect', function( done ) {
      var pollResp = Object.assign( {}, validPollResponse );
      pollResp.signature = "0".repeat(1024);
      expect( function () { tLib.validateSignature( pollResp ); } ).to.throw('the signature provided does not match this response or was not authored by the respondent');
      done();
    } );

  } );

  describe( 'signature creation', function() {

    it( 'creates a signature', function( done ) {
      fs.readFile( "./private.key", function( error, privKeyData ) {
        var pollResp = Object.assign( {}, validPollResponse );
        pollResp.signature = undefined;
        tLib.sign( pollResp, privKeyData );
        expect( pollResp.signature ).to.exist
        done();
      } );
    } );

    it( 'creates a valid signature', function( done ) {
      fs.readFile( "./private.key", function( error, privKeyData ) {
        var pollResp = Object.assign( {}, validPollResponse );
        pollResp.signature = undefined;
        tLib.sign( pollResp, privKeyData );
        expect( tLib.validateSignature( pollResp ) ).to.be.true
        done();
      } );
    } );

    it( 'changes signature when data changes', function( done ) {
      fs.readFile( "./private.key", function( error, privKeyData ) {
        var pollResp = Object.assign( {}, validPollResponse );
        tLib.sign( pollResp, privKeyData );
        var oldSig = pollResp.signature;
        pollResp.timestamp = pollResp.timestamp + 1;
        tLib.sign( pollResp, privKeyData );
        expect( pollResp.signature ).to.not.equal( oldSig );
        done();
      } );
    } );

    it( 'creates a signature based off the provided private key', function( done ) {
      fs.readFile( "./private.key", function( error, privKeyData ) {
        var pollResp = Object.assign( {}, validPollResponse );

        // Create a signature
        tLib.sign( pollResp, privKeyData );

        // Load the private key we used in creation into NodeRSA
        var respondentPrivKey = new NodeRSA();
        respondentPrivKey.importKey( privKeyData, "pkcs8-private-pem" );

        // Calculate the public key from the provided private key
        var publicPlaintext = respondentPrivKey.exportKey( 'pkcs8-public-pem' );

        // Validate the signature against the provided public key
        expect( tLib.validateSignature( pollResp, publicPlaintext ) ).to.be.true

        done();
      } );
    } );

  } );

} );
