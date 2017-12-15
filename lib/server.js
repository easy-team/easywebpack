'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');
const nodeExternals = require('webpack-node-externals');
class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.ssr = true;
    this.type = WebpackServerBuilder.TYPE;
    if (this.config.egg) {
      this.setBuildPath('app/view', true);
    } else {
      this.setPrefix(this.prefix || 'server');
    }
    this.setTarget(WebpackServerBuilder.TARGET);
    this.setNode({ __filename: false, __dirname: false });
    this.setLibraryTarget('commonjs2');
    this.setExternals([nodeExternals({
      importType: 'commonjs2', whitelist: [moduleName => {
        const moduleDir = path.join(this.baseDir, 'node_modules', moduleName);
        const pkgFile = path.join(moduleDir, 'package.json');
        let moduleFile = 'index.js';
        if (fs.existsSync(pkgFile)) {
          moduleFile = require(pkgFile).main || moduleFile;
        }
        const moduleEntry = path.join(this.baseDir, 'node_modules', moduleName, moduleFile);
        return !fs.existsSync(moduleEntry);
      }]
    })]);
    this.createFileName();
  }

  createFileName() {
    const prefix = this.config.egg ? '' : this.config.prefix;
    this.setOutputFileName(this.utils.assetsPath(prefix, '[name].js'));
  }
}
WebpackServerBuilder.TYPE = 'server';
WebpackServerBuilder.TARGET = 'node';
module.exports = WebpackServerBuilder;
