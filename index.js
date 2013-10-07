// hexo-maxcdn-plugin
// Copyright (c) 2013 - MaxCDN, a division of NetDNA, LLC.
//
// MIT Licensed

// * Author: [@mervinej](https://twitter.com/#!/mervinej)

hexo.extend.helper.register('maxcdn', require('./maxcdn.js').maxcdnify);
