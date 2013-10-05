// hexo-maxcdn-plugin
// Copyright (c) 2013 - MaxCDN, a division of NetDNA, LLC.
//
// MIT Licensed

// * Author: [@mervinej](https://twitter.com/#!/mervinej)
// * Source:
require('js-yaml');
var maxcdn = require('_maxcdn.yml');

/*
 * HELPER METHODS
 */
function processStarted() {
    try {
        return new Date(new Date()-(process.uptime()*1000)).getTime();
    } catch(e) {
        console.trace(e);
        return false;
    }
}

function throwError(msg) {
    throw new Error('hexo-maxcdn-plugin: ' +  msg);
}

var fetch = {
    version: function() {
        return '?' + (maxcdn.cachebuster || processStarted() || new Date().getTime());
    },
    source:  function() {
        if (!maxcdn.domain) {
            throwError('_maxcdn.yml must contain a cdn domain');
        }
        var domain = maxcdn.domain;
        domain.replace('https://', '').replace('http://', '');
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
    return attrs.sort.join(' ');
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
            case '.ico':
                attrs.rel = attrs.rel || 'stylesheet';
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
            case '.pdf':
            case '.svg':
            case '.swf':
                attrs.src = src + path + version;
                return '<embed ' + attributesFrom(attrs) + '></embed>';

            default:
                throw new Error('hexo-maxcdn-plugin: unknown asset type');

        }
    } catch (e) {
        throw new Error('hexo-maxcdn-plugin: unknown asset type');
    }
}

/*
 * HEXO PLUGIN HANDLING
 * - Exclude the following when hexo isn't defined, which
 *   allows for unit testing without hexo installed.
 */
if (typeof hexo !== 'undefined') {
    hexo.extend.helper.register('maxcdn', maxcdnify);
}

