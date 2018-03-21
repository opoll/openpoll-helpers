
// Imports
var expect = require('chai').expect;
var helpers = require('../');
var tLib = helpers.generic;

describe( 'blockchain generic helper', function() {

  it( 'should contain a schema version', function( done ) {
    expect( tLib.SCHEMA_VERSION !== undefined );
    done();
  } );

  it( 'should record the schema version at 0.1', function( done ) {
      expect( tLib.SCHEMA_VERSION === "0.1" );
      done();
  } );

  it( 'should convert a public key to a base64 OpenPoll address', function( done ) {
    var publicKey = "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkH0q6wOzdRRYoGecOKVj\nVQc3S9Oz3X1SZbEwQjB/e8CYp9L4FElU4w1S0QpW0qNzpTxCiGtDU8+AcHX6MpZh\n7gKe26PqQx5hpW9Dr95pZ5cIGtNCxuOSCNtIAIMQPjH2O3Hqtxt2drPtx8+v5jED\nOyHSFff8vjPM4N3RSMp2jiZV7iBHgSDW6OGETtWK1GgqWIYgRkGTearDlgSyHZU7\nStjesJEFSa52HDPkR1UzW/wbZgq+4fXfWlIX9gcsntf8jt7+weU2KnN6vivD6E3j\nrIovhRJPtILFKo01HfG5BILQrQ2x4jXCSsg52bjwTKmDZWDqtsJ8E6MU5cRAwJmL\n59p0QC7pIS/Qnt15SeqsWTEi50mA1jvjsxx0zQlOR9w6NFsrHy3YeaxH+59EF2N8\nx2IRQX7vX/gWOB8RLjb6Nqo0Dlk5CzPNZ7/5jkjYTV19FUXyvg1RKTjCOK+6PUuh\n/H/SUpimxR0Q+uteIfz0fO4NySuDUXb5LYNcmh4cshU1Oha0mAgSHRPu7OXOCY4h\nIfRwEpHXuPAlj0/t6rJPdsFntYmXTkWb6NnOiVsOdk1IB2m1nDUT6gAZBxJzcN4w\nAWVXkoJYqJ7PIlL0RuKjJbXUSydUjbLaWhIzrq6e+zArZ4TCr1SFhtp2BqvHf/4/\nEdDPx0wA3qmGAkvkEOMxixECAwEAAQ==\n-----END PUBLIC KEY-----";

    var address = "1CfaV1JY7J5kEtJVZrUoCHojkUVK2+YpeBJ/SDsu+fs=";

    expect( tLib.publicKeyToAddress( publicKey ) === address );
    done();
  } );

} );
