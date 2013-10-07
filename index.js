// hexo-maxcdn-plugin
// Copyright (c) 2013 - MaxCDN, a division of NetDNA, LLC.
//
// MIT Licensed

// * Author: [@mervinej](https://twitter.com/#!/mervinej)

var maxcdn = require('./maxcdn.js');

hexo.extend.generator.register(function(_, _, callback) {
    require('fs').writeFileSync('_maxcdn.yml',
        'domain: you.maxcdn.com\nenabled:\n- production\n- stage\n# cachebuster: your_buster\n');
    callback();
});

hexo.extend.helper.register('maxcdn', maxcdn.maxcdnify);

hexo.extend.tag.register('maxcdn', function (args) {
    if (!args.length) {
        maxcdn.throwError('tag require path');
    }
    var path = args.shift()
                    .replace(/^'/,'')
                    .replace(/^"/,'')
                    .replace(/'$/,'')
                    .replace(/"$/,'');
    var attrs = {};
    args.forEach(function(arg) {
        var splitArg = arg.split('=');
        attrs[splitArg[0]] = (splitArg[1]||'')
                                .replace(/^'/,'')
                                .replace(/^"/,'')
                                .replace(/'$/,'')
                                .replace(/"$/,'');
    });
    return maxcdn.maxcdnify(path, attrs);
});
