
// Imports
const expect = require('chai').expect;
const helpers = require('../index')
const tLib = helpers.generic;

describe( 'blockchain generic helper', function() {

  it( 'should contain a schema version', function( done ) {
    expect( tLib.SCHEMA_VERSION !== undefined );
    done();
  });

  it( 'should record the schema version at 0.1', function( done ) {
      expect( tLib.SCHEMA_VERSION === "0.1" );
      done();
  });

    describe( 'address generation', function( done ) {

      it( 'should convert a public key to a base58check OpenPoll address', function( done ) {
        const publicKey = "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkH0q6wOzdRRYoGecOKVj\nVQc3S9Oz3X1SZbEwQjB/e8CYp9L4FElU4w1S0QpW0qNzpTxCiGtDU8+AcHX6MpZh\n7gKe26PqQx5hpW9Dr95pZ5cIGtNCxuOSCNtIAIMQPjH2O3Hqtxt2drPtx8+v5jED\nOyHSFff8vjPM4N3RSMp2jiZV7iBHgSDW6OGETtWK1GgqWIYgRkGTearDlgSyHZU7\nStjesJEFSa52HDPkR1UzW/wbZgq+4fXfWlIX9gcsntf8jt7+weU2KnN6vivD6E3j\nrIovhRJPtILFKo01HfG5BILQrQ2x4jXCSsg52bjwTKmDZWDqtsJ8E6MU5cRAwJmL\n59p0QC7pIS/Qnt15SeqsWTEi50mA1jvjsxx0zQlOR9w6NFsrHy3YeaxH+59EF2N8\nx2IRQX7vX/gWOB8RLjb6Nqo0Dlk5CzPNZ7/5jkjYTV19FUXyvg1RKTjCOK+6PUuh\n/H/SUpimxR0Q+uteIfz0fO4NySuDUXb5LYNcmh4cshU1Oha0mAgSHRPu7OXOCY4h\nIfRwEpHXuPAlj0/t6rJPdsFntYmXTkWb6NnOiVsOdk1IB2m1nDUT6gAZBxJzcN4w\nAWVXkoJYqJ7PIlL0RuKjJbXUSydUjbLaWhIzrq6e+zArZ4TCr1SFhtp2BqvHf/4/\nEdDPx0wA3qmGAkvkEOMxixECAwEAAQ==\n-----END PUBLIC KEY-----";
    
        const address = "1mMTEJpEryi2gBms18kz1renrEfJEMrmWFdTXNk";
    
        expect( tLib.publicKeyToAddress( publicKey ) === address );
        done();
      });

      it( 'address should be correct length', function( done ) {
        const publicKey = "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkH0q6wOzdRRYoGecOKVj\nVQc3S9Oz3X1SZbEwQjB/e8CYp9L4FElU4w1S0QpW0qNzpTxCiGtDU8+AcHX6MpZh\n7gKe26PqQx5hpW9Dr95pZ5cIGtNCxuOSCNtIAIMQPjH2O3Hqtxt2drPtx8+v5jED\nOyHSFff8vjPM4N3RSMp2jiZV7iBHgSDW6OGETtWK1GgqWIYgRkGTearDlgSyHZU7\nStjesJEFSa52HDPkR1UzW/wbZgq+4fXfWlIX9gcsntf8jt7+weU2KnN6vivD6E3j\nrIovhRJPtILFKo01HfG5BILQrQ2x4jXCSsg52bjwTKmDZWDqtsJ8E6MU5cRAwJmL\n59p0QC7pIS/Qnt15SeqsWTEi50mA1jvjsxx0zQlOR9w6NFsrHy3YeaxH+59EF2N8\nx2IRQX7vX/gWOB8RLjb6Nqo0Dlk5CzPNZ7/5jkjYTV19FUXyvg1RKTjCOK+6PUuh\n/H/SUpimxR0Q+uteIfz0fO4NySuDUXb5LYNcmh4cshU1Oha0mAgSHRPu7OXOCY4h\nIfRwEpHXuPAlj0/t6rJPdsFntYmXTkWb6NnOiVsOdk1IB2m1nDUT6gAZBxJzcN4w\nAWVXkoJYqJ7PIlL0RuKjJbXUSydUjbLaWhIzrq6e+zArZ4TCr1SFhtp2BqvHf/4/\nEdDPx0wA3qmGAkvkEOMxixECAwEAAQ==\n-----END PUBLIC KEY-----";
        
        const addressGenerated = tLib.publicKeyToAddress(publicKey);
        const isCorrectLength = addressGenerated.length == 47 ? true : false;

        expect(isCorrectLength).to.be.true;
        done();
      });

  });

  describe( 'hashing', function( done ) {

    it( 'should default to sha 256 and should be correct hash', function( done ) {
      const testString = 'hashme';
      const trueSha256Hash = "02208b9403a87df9f4ed6b2ee2657efaa589026b4cce9accc8e8a5bf3d693c86";
      const generatedHash = tLib.hash(testString);

      expect(generatedHash).to.equal(trueSha256Hash);
      done();
    });

    it( 'ripemd160 hash should be correct', function( done ) {
      const testString = 'hashme';
      const trueRipemd160Hash = "d16499d0d9b8e425ef4457dee18fe9e3aca05bbd";
      const generatedHash = tLib.hash(testString, "ripemd160");

      expect(generatedHash).to.equal(trueRipemd160Hash);
      done();
    });

    it( 'bcrypt hash should be correct length', function( done ) {
      const testString = 'hashme';
      const bcryptHash = tLib.hash(testString, "bcrypt");
      const isCorrectLength = bcryptHash.length == 60 ? true : false;

      expect(isCorrectLength).to.be.true;
      done();
    });
    

  });

  describe( 'general utilities', function( done ) {

    it( 'stringify data should always return a string given a string', function( done ) {
      const testString = "teststring";
      const result = tLib.stringifyData(testString);

      expect(result).to.be.a('string');
      done();
    });

    it( 'stringify data should always return a string given an object', function( done ) {
      const testObject = {
        foo: "data1",
        bar: "data2"
      };
      const result = tLib.stringifyData(testObject);

      expect(result).to.be.a('string');
      done();
    });

    it( 'generate random id should default to 32 byte id', function( done ) {
      const generatedId = tLib.generateRandomId();
      const isCorrectLength = generatedId.length == 64 ? true : false;

      expect(isCorrectLength).to.be.true;
      done();
    });

    it( 'generate random id should generate a hex value', function( done ) {
      const generatedId = tLib.generateRandomId(128);
      const regex = /[0-9a-fA-F]+/;
      const isMatch = regex.test(generatedId);

      expect(isMatch).to.be.true;
      done();
    });

    it( 'secret generated should be hex format', function( done ) {
      const testString = "password";
      const generatedSecret = tLib.generateSecret(testString);
      const regex = /[0-9a-fA-F]+/;
      const isMatch = regex.test(generatedSecret);

      expect(isMatch).to.be.true;
      done();
    });

    it( 'secret generated should correct length', function( done ) {
      const password = "password";
      const secret = tLib.generateSecret(password);
      const secretIsCorrectLength = secret.length == 1024 ? true : false;

      expect(secretIsCorrectLength);
      done();
    });

    it( 'public key fetched from keypair should be hex', function( done ) {
      const password = "password";
      const secret = tLib.generateSecret(password);
      const secretIsCorrectLength = secret.length == 1024 ? true : false;

      expect(secretIsCorrectLength);
      done();
    });

  });

});
