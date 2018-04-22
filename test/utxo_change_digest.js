
// Imports
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('../')
var tLib = helpers.utxo;

// Some of our factories
var validUTXOChangeDigest = require("./schemas/0.1/validUTXOChangeDigest.json");

describe( 'UTXO Change Digest helper', function() {

  it('validates a valid UTXO change digest', function(done) {
    expect( tLib.validateChangeDigest(validUTXOChangeDigest) ).to.equal( true );
    done();
  });

  it('does not vaidate a UTXO change digest with missing balances', function(done) {
    var invalidUTXOChangeDigest = Object.assign( {}, validUTXOChangeDigest );
    invalidUTXOChangeDigest.balances = undefined;
    expect( tLib.validateChangeDigest(invalidUTXOChangeDigest) ).to.equal(false);
    done();
  });

  it('properly updates a ledger', function(done) {
    var L = {};

    var setLedger = function(addr, bal) {
      L[addr] = bal;
    };

    tLib.applyUTXOChangeDigestToLedger( validUTXOChangeDigest, setLedger );

    // Check the balances were updated..
    expect( L["OPEN1mMTEJpEryi2gBms18kz1renrEfJEMrmWFdTXNkPOLL"] ).to.equal( 40000 );

    done();
  });

} );
