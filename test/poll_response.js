
// Imports
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('../')
var tLib = helpers.pollResponse;
const privateKeyPem = fs.readFileSync("./private.key", { encoding: "utf8" });
const publicKeyPem = fs.readFileSync("./public.key", { encoding: "utf8" });
const validator = require("@openpoll/schemas").validator;

// Some of our factories
var validPoll = require("./schemas/0.1/validPollSimple.json");
var validPollResponse = require('./schemas/0.1/validPollResponseSimple.json');

describe( 'poll response helper', function() {

  it( 'should reference the /poll/response schema', function( done ) {
    expect( tLib.BLOCK_SCHEMA["$id"] ).to.equal( "https://schemas.openpoll.io/0.1/poll/response.json" );
    done();
  } );

  it( 'should validate a valid schema', function( done ) {
    var valid = tLib.validateSchema(validPollResponse);
    expect( valid ).to.equal(true);
    done();
  } );

  it("should validate answers against the poll questions", function () {
    var valid = tLib.validateAnswers(validPoll, validPollResponse);
    expect(valid).to.equal(true);
  });

  it( 'does not validate a schema without a poll hash', function( done ) {
      var invalidPollResponse = Object.assign( {}, validPollResponse );
      invalidPollResponse.pollHash = undefined;
      invalidPollResponse.timestamp = undefined;
      invalidPollResponse.respondentAddress = undefined;
      invalidPollResponse.responseData = undefined;
      invalidPollResponse.respondentDemographics = undefined;
      invalidPollResponse.signature = undefined;
      expect( tLib.validateSchema( invalidPollResponse ) ).to.equal(false);
      done();
  } );

  it( 'properly computes the hash of a poll response', function( done ) {
    var pollResp = Object.assign( {}, validPollResponse );
    pollResp.hash = undefined;
    tLib.hash( pollResp );

    expect( pollResp.hash ).to.equal( validPollResponse.hash );
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
      pollResp.respondentAddress = "OPEN1mMTEJpEryi2gBms18kz1renrEfJEMrmWFdTXNkWRONG";
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

    it( 'creates a signature', function( ) {
      var pollResp = Object.assign( {}, validPollResponse );
      pollResp.signature = undefined;
      tLib.sign( pollResp, privateKeyPem, publicKeyPem );
      expect( pollResp.signature ).to.exist
    } );

    it( 'creates a valid signature', function( ) {
      var pollResp = Object.assign( {}, validPollResponse );
      pollResp.signature = undefined;
      tLib.sign( pollResp, privateKeyPem, publicKeyPem );
      expect( tLib.validateSignature( pollResp ) ).to.be.true
    } );

    it( 'changes signature when data changes', function( ) {
      var pollResp = Object.assign( {}, validPollResponse );
      tLib.sign( pollResp, privateKeyPem, publicKeyPem );
      var oldSig = pollResp.signature;
      pollResp.timestamp = pollResp.timestamp + 1;
      tLib.sign( pollResp, privateKeyPem, publicKeyPem );
      expect( pollResp.signature ).to.not.equal( oldSig );
    } );

    it( 'creates a signature based off the provided private key', function( ) {
      var pollResp = Object.assign( {}, validPollResponse );

      // Create a signature
      tLib.sign( pollResp, privateKeyPem, publicKeyPem );

      // Validate the signature against the provided public key
      expect( tLib.validateSignature( pollResp, publicKeyPem ) ).to.be.true
    } );

  } );

} );
