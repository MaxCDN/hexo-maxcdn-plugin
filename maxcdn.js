// Copyright (c) 2013 - MaxCDN, a division of NetDNA, LLC.
//
// MIT Licensed

// * Author: [@mervinej](https://twitter.com/#!/mervinej)
// * Source:
require('js-yaml');
var write = require('fs').appendFileSync;
var config;
try {
    config = require('./_maxcdn.yml');
} catch (e) {
    console.trace(e);
}

/*
 * HELPER METHODS
 */
var started;
function processStarted() {
    started = started || Math.floor((new Date())-(process.uptime()*1000)).toString();
    return started;
}

function throwError(msg) {
    write('/tmp/hexo-maxcdn.error', 'Error: hexo-maxcdn-plugin - '+msg);
    throw new Error('hexo-maxcdn-plugin - ' +  msg);
}

var fetch = {
    version: function() {
        // TODO: Wouldn't be nice to use a git sha?
        return '?' + (config.cachebuster || processStarted());
    },
    source:  function() {
        if (!config.domain) {
            throwError('_maxcdn.yml must contain a cdn domain');
        }
        if (config.enabled !== true && !config.enabled.join(' ').match(process.env.NODE_ENV)) {
            return '';
        }
        var domain = config.domain;
        domain.replace(/^https:\/\//, '')
              .replace(/^http:\/\//, '')
              .replace(/\/$/, '');

        return '//'+domain;
    }
};

function escape(string) {
    string = string || '';
    return string.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#x27;');
}

function attributesFrom(options) {
    var attrs = [];
    Object.keys(options).forEach(function(name) {

        // Allow for false to generate attribute with 'false' value.
        if (options[name] === false) {
            options[name] = 'false';
        }

        // Allow for null || undefined || '' to generate empty
        // attributes.
        options[name] = options[name] || '';

        attrs.push(escape(name)+'=\''+escape(options[name])+'\'');
    });
    return attrs.sort().join(' ');
}

/*
 * CORE METHODS
 */
function maxcdnify(path, attrs) {
    var src     = fetch.source();
    var version = fetch.version();

    // optional attrs, e.g.:
    // - width
    // - height
    // - alt
    attrs = attrs || {};
    try {
        switch (path.match(/\.[a-z]+$/)[0]) {
            // link tag
            case '.css':
                attrs.rel = attrs.rel || 'stylesheet';
            case '.ico':
                attrs.rel = attrs.rel || 'icon';
                attrs.href = src + path + version;
                return '<link ' + attributesFrom(attrs) + '/>';

            // script tag
            case '.js':
                attrs.type = attrs.type || 'text/javascript';
                attrs.src = src + path + version;
                return '<script ' + attributesFrom(attrs) + '></script>';

            // image tag
            case '.bmp':
            case '.gif':
            case '.jpg':
            case '.jpeg':
            case '.png':
                attrs.src = src + path + version;
                return '<img ' + attributesFrom(attrs) + ' />';

            // embed
            case '.svg':
                attrs.type = attrs.type || 'image/svg+xml';
            case '.pdf':
                attrs.src = src + path + version;
                return '<embed ' + attributesFrom(attrs) + '></embed>';

            default:
                throw new Error('hexo-maxcdn-plugin: unknown asset type');

        }
    } catch (e) {
        throw new Error('hexo-maxcdn-plugin: unknown asset type');
    }
}
module.exports = {
    config: config,
    processStarted: processStarted,
    throwError: throwError,
    fetch: fetch,
    escape: escape,
    attributesFrom: attributesFrom,
    maxcdnify: maxcdnify
};
