'use strict';
module.exports = exports = require('./lib/tool');
exports.utils = require('./lib/utils');
exports.webpack = exports.utils.getWebpack();
exports.merge = require('webpack-merge');
exports.KoaWebpackHotMiddleware = require('./lib/hot');
exports.KoaWebpackDevMiddleware = require('./lib/dev');
exports.KoaProxyMiddleware = require('./lib/proxy');