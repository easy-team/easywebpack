'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');
const nodeExternals = require('webpack-node-externals');
const babelrc = require('../../config/babel.web');
class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.ssr = true;
    this.type = WebpackServerBuilder.TYPE;
    this.setBabelrc(babelrc);
    this.setTarget(WebpackServerBuilder.TARGET);
    this.setNode({ __filename: false, __dirname: false });
    this.setLibraryTarget('commonjs');
    const notUseDefault = this.config.nodeExternals && this.config.nodeExternals.useDefault === false;
    /* istanbul ignore next */
    const defaultNodeExternals = notUseDefault ? { importType: 'commonjs' } : {
      importType: 'commonjs', whitelist: [moduleName => {
        const moduleDir = path.join(this.baseDir, 'node_modules', moduleName);
        const pkgFile = path.join(moduleDir, 'package.json');
        let moduleFile = 'index.js';
        /* istanbul ignore next */
        if (fs.existsSync(pkgFile)) {
          /* istanbul ignore next */
          moduleFile = require(pkgFile).main || moduleFile;
        }
        /* istanbul ignore next */
        const moduleEntry = path.join(this.baseDir, 'node_modules', moduleName, moduleFile);
        return !fs.existsSync(moduleEntry);
      }]
    };
    this.setExternals([nodeExternals(this.merge(defaultNodeExternals, this.config.nodeExternals))]);
    this.createFileName();
    this.setStartCreateQueue(this.setBabelENV);
  }

  get buildPath() {
    if (this.egg) {
      return this.utils.normalizeBuildPath('app/view', this.baseDir);
    }
    return super.buildPath;
  }

  createFileName() {
    this.setOutputFileName('[name].js');
  }

  createOptimization() {
    return this.webpackOptimize.getNodeOptimization();
  }
}
WebpackServerBuilder.TYPE = 'server';
WebpackServerBuilder.TARGET = 'node';
module.exports = WebpackServerBuilder;
