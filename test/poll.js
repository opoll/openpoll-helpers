
// Imports
var expect = require('chai').expect;
var helpers = require('../openpoll_helpers')
var tLib = helpers.poll;

// Factories
var validPollSimple = require('./schemas/0.1/validPollSimple.json' );

console.log( tLib.getFundingDistribution( validPollSimple ) );

describe( 'poll helper', function() {

  it( 'should contain a reference to the /poll/poll schema', function( done ) {
    expect( tLib.POLL_SCHEMA_PATH ).to.equal( "/poll/poll" );
    done();
  } );

  describe( 'poll expiration functionality', function() {

    it( 'should record the poll as expired if after expiry date', function( done ) {
      var poll = Object.assign( {}, validPollSimple );
      poll.expiry = Math.floor(new Date() / 1000) - 10;
      expect( tLib.isExpired( poll ) ).to.be.true;
      done();
    } );

    it( 'should not record a poll as expired if it has not passed its expiration', function( done ) {
      var poll = Object.assign( {}, validPollSimple );
      poll.expiry = Math.floor(new Date() / 1000) + 10;
      expect( tLib.isExpired( poll ) ).to.be.false;
      done();
    } );

  } );

  describe( 'poll hashing', function() {

    it( 'should produce a correct poll hash', function( done ) {
      var poll = Object.assign( {}, validPollSimple );
      var _hash = poll.hash;
      expect( tLib.hash( poll ) ).to.equal( _hash );
      expect( poll.hash ).to.equal( _hash );
      done();
    } );

    it( 'should change when the content changes', function( done ) {
      var poll = Object.assign( {}, validPollSimple );
      var _hash = poll.hash;
      poll.timestamp++;
      tLib.hash( poll );
      expect( poll.hash ).to.not.equal( _hash );
      done();
    } );

  } );

  describe( 'funding distribution', function() {

    it( 'contains a constant representing 15% network distribution', function() {
      expect( tLib.NETWORK_FUND_PERCENT ).to.equal( 0.15 );
    } );

    it( 'distributes the remainder of the network cost to respondents', function() {
      var poll = Object.assign( {}, validPollSimple );
      poll.totalFunding = 100;
      var pollFundDistr = tLib.getFundingDistribution( poll );
      expect( poll.totalFunding - (poll.totalFunding * tLib.NETWORK_FUND_PERCENT) ).to.equal( pollFundDistr.respondent._total );
    } );

    it( 'sums to the total funding', function() {
      var poll = Object.assign( {}, validPollSimple );
      var pollFundDistr = tLib.getFundingDistribution( poll );
      var sum = 0;
      sum += pollFundDistr.network.shard + pollFundDistr.network.mcif;
      sum += pollFundDistr.respondent.individual * poll.maxRespondents;
      expect( sum ).to.equal( poll.totalFunding );
    } );

  } );
} );
