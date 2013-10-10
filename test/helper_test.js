var assert = require('assert');
var maxcdn = require('../maxcdn.js');

// setup test env
process.env.NODE_ENV = 'test';
maxcdn.config.enabled.push('test');

describe('maxcdn-maxcdn', function () {
    describe('helper methods', function () {
        describe('processStarted', function () {
            var result;
            before(function(done) {
                result = maxcdn.processStarted();
                done();
            });
            it('is a string', function (done) {
                assert.equal(typeof result, 'string'); // is a string
                done();
            });
            it('contains only numbers', function (done) {
                assert(result.match(/^[0-9]+$/));
                done();
            });
            it('is 13 characters long', function (done) {
                assert.equal(result.length, 13);
                done();
            });
            it('is always the same', function (done) {
                assert.equal(result, maxcdn.processStarted());
                // Why setTimeout:
                // 500 ms makes all the difference when using Math.floor with
                // time.
                setTimeout(function() {
                    assert.equal(result, maxcdn.processStarted());
                    done();
                }, 500);
                // NOTE: This test will display yellow because mocha thinks
                // it's slow due to 'setTimeout'.
            });
        });
        describe('throwError', function () {
            it('throws an error containing message', function (done) {
                assert.throws(function () {
                    maxcdn.throwError('test message');
                }, /^Error: hexo-maxcdn-plugin - test message$/);
                done();
            });
        });
        describe('fetch.version', function () {
            it('pulls from config first', function (done) {
                assert.equal(maxcdn.fetch.version(), '?cachebuster');
                done();
            });
            it('pulls from processStarted seconds', function (done) {
                var cachebuster = maxcdn.config.cachebuster;
                maxcdn.config.cachebuster = undefined;
                assert.equal(maxcdn.fetch.version(), '?'+maxcdn.processStarted());
                maxcdn.config.cachebuster = cachebuster;
                done();
            });
        });
        describe('fetch.source', function () {
            it('pulls from config', function (done) {
                assert.equal(maxcdn.fetch.source(), '//you.maxcdn.com');
                done();
            });
            it('returns empty when environment is not enabled', function (done) {
                process.env.NODE_ENV = 'badenv';
                assert.equal(maxcdn.fetch.source(), '');
                process.env.NODE_ENV = 'test';
                done();
            });
            it('throws error if config is undefined', function (done) {
                var domain = maxcdn.config.domain;
                maxcdn.config.domain = undefined;
                assert.throws(function () {
                    maxcdn.fetch.source();
                }, Error);
                maxcdn.config.domain = domain;
                done();
            });
        });
        describe('escape', function () {
            var escapes = {
                '&': '&amp;',
                '<': '&lt;',
                '"': '&quot;',
                '\'': '&#x27;'
            };
            Object.keys(escapes).forEach(function(char) {
                it('escapes '+char, function(done) {
                    assert(maxcdn.escape('...'+char+'...').match(escapes[char]));
                    done();
                });
            });
        });
        describe('attributesFrom', function () {
            it('creates attributes', function (done) {
                assert.equal(
                    maxcdn.attributesFrom({ foo: "bar", bar: "foo" }),
                    "bar='foo' foo='bar'"
                );
                done();
            });
            it('turns false in to false string', function (done) {
                assert.equal(
                    maxcdn.attributesFrom({ foo: false, bar: "foo" }),
                    "bar='foo' foo='false'"
                );
                done();
            });
            it('allows for empty attributes using null', function (done) {
                assert.equal(
                    maxcdn.attributesFrom({ foo: null, bar: "foo" }),
                    "bar='foo' foo=''"
                );
                done();
            });
            it('allows for empty attributes using undefined', function (done) {
                assert.equal(
                    maxcdn.attributesFrom({ foo: undefined, bar: "foo" }),
                    "bar='foo' foo=''"
                );
                done();
            });
            it('allows for empty attributes using an empty string', function (done) {
                assert.equal(
                    maxcdn.attributesFrom({ foo: '', bar: "foo" }),
                    "bar='foo' foo=''"
                );
                done();
            });
        });
    });

    describe('maxcdnify', function () {
        it('throws error on unkown ext', function(done) {
            assert.throws(function() {
                maxcdn.maxcdnify('/foo.bad');
            }, Error);
            done();
        });

        var tags = {
            'link': [ '.css', '.ico' ],
            'script': [ '.js' ],
            'img': [ '.bmp', '.gif', '.jpg', '.jpeg', '.png' ],
            'embed': [ '.pdf', '.svg' ]
        };

        Object.keys(tags).forEach(function(tag) {
            tags[tag].forEach(function(ext) {
                it(ext+' yields '+tag+' tag', function(done) {
                    assert(maxcdn.maxcdnify('/foo'+ext).match(tag));
                    done();
                });
            });
        });

        it('css includes rel=stylesheet by default', function (done) {
            assert(maxcdn.maxcdnify('/foo.css').match("rel='stylesheet'"));
            done();
        });
        it('ico includes rel=icon by default', function (done) {
            assert(maxcdn.maxcdnify('/foo.ico').match("rel='icon'"));
            done();
        });
        it('js includes type=text/javascript by default', function (done) {
            assert(maxcdn.maxcdnify('/foo.js').match("type='text/javascript'"));
            done();
        });
        it('svg includes type=image/svg+xml by default', function (done) {
            assert(maxcdn.maxcdnify('/foo.svg').match(/type=\'image\/svg\+xml\'/));
            done();
        });
        it('includes customs attrs', function (done) {
            assert(maxcdn.maxcdnify('/foo.css', { foo: 'bar' }).match("foo='bar'"));
            done();
        });
    });
    describe('config', function () {
        describe('domain', function () {
            it('includes domain', function (done) {
                assert(maxcdn.maxcdnify('/foo.css').match(maxcdn.config.domain));
                done();
            });
        });

        describe('enabled', function () {
            it('accepts true', function (done) {
                // adjust env and config
                process.env.NODE_ENV = 'disabled_env';
                var enabled = maxcdn.config.enabled;
                maxcdn.config.enabled = true;

                assert(maxcdn.maxcdnify('/foo.css').match(maxcdn.config.domain));

                // reset env and config
                process.env.NODE_ENV = 'test';
                maxcdn.config.enabled = enabled;
                done();
            });
            it('disables', function (done) {
                // adjust env and config
                process.env.NODE_ENV = 'disabled_env';

                assert(!maxcdn.maxcdnify('/foo.css').match(maxcdn.config.domain));

                // reset env and config
                process.env.NODE_ENV = 'test';
                done();
            });
        });

        describe('cachebuster', function () {
            it('includes cachebuster', function (done) {
                assert(maxcdn.maxcdnify('/foo.css').match(maxcdn.config.cachebuster));
                done();
            });
        });

    });
});
