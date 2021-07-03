'use strict';
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

class VueSSRDynamicChunkPlugin {
  constructor(opts) {
    this.opts = Object.assign({ }, { chunk: true }, opts);
  }

  apply(compiler) {
    compiler.hooks.emit.tap('VueSSRDynamicChunkPlugin', (compilation, callback) => {
      const buildPath = compilation.options.output.path;
      const chunkPath = path.join(buildPath, 'node_modules'); 
         
      if (!fs.existsSync(chunkPath)) {
        mkdirp.sync(chunkPath);
      }
      
      compilation.chunks.forEach(chunk => {
        if (!this.opts.chunk) {
          return;
        }

        const asyncChunks = chunk.getAllAsyncChunks();

        asyncChunks && asyncChunks.forEach(asyncChunk => {
          asyncChunk.files.forEach(filename => {
            const filepath = path.join(chunkPath, filename);
            const source = compilation.assets[filename].source();
            fs.writeFileSync(filepath, source, 'utf8');
          });
        })
      });
      callback && callback();
    });
  }
}

module.exports = VueSSRDynamicChunkPlugin;
