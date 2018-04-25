
// Imports
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('../')
var tLib = helpers.completed_shard;

// Some of our factories
var validCompletedShard = require("./schemas/0.1/validCompletedShard.json");

describe( 'a completed shard', function() {

  it('validates a valid completed shard', function(done) {
    expect( tLib.validate(validCompletedShard) ).to.equal( true );
    done();
  });

} );
