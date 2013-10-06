var assert = require('assert');

var plugin = require('../index.js');

describe('maxcdn-plugin', function () {
    describe('helper methods', function () {
        describe('processStarted', function () {
            var result;
            before(function(done) {
                result = plugin.processStarted();
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
                assert.equal(result, plugin.processStarted());
                // Why setTimeout:
                // 500 ms makes all the difference when using Math.floor with
                // time.
                setTimeout(function() {
                    assert.equal(result, plugin.processStarted());
                    done();
                }, 500);
                // NOTE: This test will display yellow because mocha thinks
                // it's slow due to 'setTimeout'.
            });
        });
        describe('throwError', function () {
            it('throws an error containing message', function (done) {
                assert.throws(function () {
                    plugin.throwError('test message');
                }, /^Error: hexo-maxcdn-plugin - test message$/);
                done();
            });
        });
        describe('fetch.version', function () {
            it('pulls from config first', function (done) {
                assert.equal(plugin.fetch.version(), '?cachebuster');
                done();
            });
            it('pulls from processStarted seconds', function (done) {
                var cachebuster = plugin.maxcdn.cachebuster;
                plugin.maxcdn.cachebuster = undefined;
                assert.equal(plugin.fetch.version(), '?'+plugin.processStarted());
                plugin.maxcdn.cachebuster = cachebuster;
                done();
            });
        });
        describe('fetch.source', function () {
            it('pulls from config', function (done) {
                assert.equal(plugin.fetch.source(), '//you.maxcdn.com');
                done();
            });
            it('throws error if config is undefined', function (done) {
                var domain = plugin.maxcdn.domain;
                plugin.maxcdn.domain = undefined;
                assert.throws(function () {
                    plugin.fetch.source();
                }, Error);
                plugin.maxcdn.domain = domain;
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
                    assert(plugin.escape('...'+char+'...').match(escapes[char]));
                    done();
                });
            });
        });
        describe('attributesFrom', function () {
            it('creates attributes', function (done) {
                assert.equal(
                    plugin.attributesFrom({ foo: "bar", bar: "foo" }),
                    "bar='foo' foo='bar'"
                );
                done();
            });
            it('turns false in to false string', function (done) {
                assert.equal(
                    plugin.attributesFrom({ foo: false, bar: "foo" }),
                    "bar='foo' foo='false'"
                );
                done();
            });
            it('allows for empty attributes using null', function (done) {
                assert.equal(
                    plugin.attributesFrom({ foo: null, bar: "foo" }),
                    "bar='foo' foo=''"
                );
                done();
            });
            it('allows for empty attributes using undefined', function (done) {
                assert.equal(
                    plugin.attributesFrom({ foo: undefined, bar: "foo" }),
                    "bar='foo' foo=''"
                );
                done();
            });
            it('allows for empty attributes using an empty string', function (done) {
                assert.equal(
                    plugin.attributesFrom({ foo: '', bar: "foo" }),
                    "bar='foo' foo=''"
                );
                done();
            });
        });
    });

    describe('maxcdnify', function () {
        it('throws error on unkown ext', function(done) {
            assert.throws(function() {
                plugin.maxcdnify('/foo.bad');
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
                    assert(plugin.maxcdnify('/foo'+ext).match(tag));
                    done();
                });
            });
        });

        it('css includes rel=stylesheet by default', function (done) {
            assert(plugin.maxcdnify('/foo.css').match("rel='stylesheet'"));
            done();
        });
        it('ico includes rel=icon by default', function (done) {
            assert(plugin.maxcdnify('/foo.ico').match("rel='icon'"));
            done();
        });
        it('js includes type=text/javascript by default', function (done) {
            assert(plugin.maxcdnify('/foo.js').match("type='text/javascript'"));
            done();
        });
        it('svg includes type=image/svg+xml by default', function (done) {
            assert(plugin.maxcdnify('/foo.svg').match(/type=\'image\/svg\+xml\'/));
            done();
        });
        it('includes customs attrs', function (done) {
            assert(plugin.maxcdnify('/foo.css', { foo: 'bar' }).match("foo='bar'"));
            done();
        });
    });
});
