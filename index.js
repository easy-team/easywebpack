'use strict';
exports.webpack = require('webpack');
exports.merge = require('webpack-merge');
exports.build = require('./tool/build');
exports.Utils = require('./utils/utils');
exports.Loader = require('./utils/loader');
exports.WebpackBaseBuilder = require('./builder/base');
exports.WebpackClientBuilder = require('./builder/client');
exports.WebpackServerBuilder = require('./builder/server');
