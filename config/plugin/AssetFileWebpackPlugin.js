'use strict';
const path = require('path');
const fs = require('fs');

class AssetFileWebpackPlugin {
  constructor(opts) {
    this.opts = opts;
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      this.opts.assets.forEach(chunk => {
        const filepath = chunk.filepath;
        const outputName = chunk.outputName;
        const content = fs.readFileSync(filepath, 'utf8');
        compilation.assets[outputName] = {
          source() {
            return content;
          },
          size() {
            return content.length;
          }
        };
      });
      compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPlugin, callback) => {
        const paths = this.opts.assets.reduce((result, chunk) => {
          result.push(chunk.outputPath);
          return result;
        }, []);
        htmlPlugin.assets.js = paths.concat(htmlPlugin.assets.js);
        callback(null, htmlPlugin);
      });
    });
  }
}

module.exports = AssetFileWebpackPlugin;