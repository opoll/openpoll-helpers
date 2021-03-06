
// Imports
var expect = require('chai').expect;
var helpers = require('../')
var factory = require('../helpers/factory');

describe( 'object factory', function() {

  it( 'should exist', function( done ) {
    expect( factory ).to.exist;
    done();
  } );

  describe( 'poll generation', function( done ) {

    it( 'should generate a valid poll', function( done ) {
      var generatedPoll = factory.generateTestPoll();
      var valid = helpers.poll.validateSchema( generatedPoll );
      expect( valid ).to.equal( true );
      done();
    } );

    it( 'should generate with a correct hash', function( done ) {
      var generatedPoll = factory.generateTestPoll();
      var _hash = generatedPoll.hash;
      generatedPoll.hash = undefined;
      helpers.poll.hash( generatedPoll );
      expect( generatedPoll.hash ).to.equal( _hash );
      done();
    } );

    it( 'should not generate an expired poll', function( done ) {
      var generatedPoll = factory.generateTestPoll();
      expect( helpers.poll.isExpired( generatedPoll ) ).to.be.false;
      done();
    } );

  } );

} );
