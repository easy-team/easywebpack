'use strict';
const path = require('path');
const fs = require('fs');
const utils = require('../../utils/utils');

class AssetFileWebpackPlugin {
  constructor(opts) {
    this.opts = opts;
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPlugin, callback) => {
        const outputPaths = [];
        this.opts.chunks.forEach(chunk => {
          const chunkManifestFile = utils.getCompileTempDir(`${this.opts.env}/config/manifest-${chunk}.json`);
          if (fs.existsSync(chunkManifestFile)) {
            const manifest = require(chunkManifestFile);
            const key = `${chunk}.js`;
            if(manifest[key]) {
              const outputName = manifest[key].replace(this.opts.publicPath, '');
              const publicPath = compiler.options.output.publicPath;
              const outputPath = compiler.options.output.path;
              const filepath = path.join(outputPath, outputName);
              if (fs.existsSync(filepath)) {
                const content = fs.readFileSync(filepath, 'utf8');
                compilation.assets[outputName] = {
                  source() {
                    return content;
                  },
                  size() {
                    return content.length;
                  }
                };
                outputPaths.push(publicPath + outputName);
              }
            }
          }
        });
        htmlPlugin.assets.js = outputPaths.concat(htmlPlugin.assets.js);
        callback(null, htmlPlugin);
      });
    });
  }
}

module.exports = AssetFileWebpackPlugin;