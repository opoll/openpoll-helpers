
// Imports
var expect = require('chai').expect;
var helpers = require('../openpoll_helpers')
var tLib = helpers.poll;

// Factories
var validPollSimple = require('./schemas/0.1/validPollSimple.json' );

describe( 'poll helper', function() {

  it( 'should contain a reference to the /poll/poll schema', function( done ) {
    expect( tLib.POLL_SCHEMA_PATH ).to.equal( "/poll/poll" );
    done();
  } );

  it( 'should validate a valid schema', function( done ) {
    expect( tLib.validateSchema( validPollSimple ).errors.length ).to.equal(0);
    done();
  } );

  it( 'should not validate objects not conforming to schema', function( done ) {
    var poll = Object.assign( {}, validPollSimple );
    poll.timestamp = "123123123";
    poll.imageId = "5";
    poll.questions = undefined;
    poll.maxRespondents = -6;
    poll.totalFunding = -1000;
    expect( tLib.validateSchema( poll ).errors.length ).to.equal(5);
    done();
  } );

  describe( 'genesis block generation', function() {

    it( 'should contain the same poll id', function( done ) {
      var genesisBlock = tLib.generateGenesisBlock( validPollSimple );
      expect( genesisBlock.pollHash ).to.equal( validPollSimple.hash );
      done();
    } );

    it( 'should contain 0 responses', function( done ) {
      var genesisBlock = tLib.generateGenesisBlock( validPollSimple );
      expect( genesisBlock.responses.length ).to.equal( 0 );
      done();
    } );

    it( 'should have a nonce of 0', function( done ) {
      var genesisBlock = tLib.generateGenesisBlock( validPollSimple );
      expect( genesisBlock.nonce ).to.equal( 0 );
      done();
    } );

    it( 'should return the correct hash', function( done ) {
      var genesisBlock = tLib.generateGenesisBlock( validPollSimple );
      var _hash = genesisBlock.hash;
      expect( helpers.shard_block.hash( genesisBlock) ).to.equal( _hash );
      done();
    } );

    it( 'should be considered the genesis block', function( done ) {
      var genesisBlock = tLib.generateGenesisBlock( validPollSimple );
      expect( helpers.shard_block.isGenesis( genesisBlock ) ).to.be.true;
      done();
    } );

      it( 'should contain the same timestamp as the poll', function( done ) {
        var genesisBlock = tLib.generateGenesisBlock( validPollSimple );
        expect( genesisBlock.timestamp ).to.equal( validPollSimple.timestamp );
        done();
      } );

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
