
// Imports
var expect = require('chai').expect;
var helpers = require('../index')
var tLib = helpers.shard_block;

// Factories
var factory = require('../helpers/factory');
var validPollSimple = require('./schemas/0.1/validPollSimple.json' );

describe( 'shard block helper', function() {

  it( 'should exist', function( done ) {
    expect( tLib ).to.exist;
    done();
  } );

  it( 'should report if a block is a genesis block properly', function( done ) {
    var testShardBlock = {
      prevHash: "0".repeat(64)
    };

    expect( tLib.isGenesis( testShardBlock ) ).to.be.true;
    done();
  } );

} );
