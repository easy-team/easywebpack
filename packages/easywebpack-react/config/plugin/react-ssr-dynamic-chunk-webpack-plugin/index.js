'use strict';
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

class ReactSSRDynamicChunkPlugin {
  constructor(opts) {
    this.opts = Object.assign({ }, { chunk: true }, opts);
  }

  apply(compiler) {
    compiler.hooks.emit.tap('ReactSSRDynamicChunkPlugin', (compilation, callback) => {
      const buildPath = compilation.options.output.path;
         
      
      [...compilation.chunks].forEach(chunk => {
        if (!this.opts.chunk) {
          return;
        }

        const chunks = [ ...chunk.files];
        const asyncChunks = [ ...chunk.getAllAsyncChunks()];
        const mainChunkFile = chunks.length > 0 ? chunks[0] : null; 
        const mainChunkDir = mainChunkFile ? path.dirname(mainChunkFile) : null; 
        asyncChunks && asyncChunks.forEach(asyncChunk => {
          asyncChunk.files.forEach(filename => {
            const filepath = mainChunkDir ? path.join(buildPath, mainChunkDir, filename) : path.join(buildPath, filename);
            const filedir = path.dirname(filepath);
            if (!fs.existsSync(filedir)) {
              mkdirp.sync(filedir);
            }  
            const source = compilation.assets[filename].source();
            fs.writeFileSync(filepath, source, 'utf8');
          });
        })
      });
      callback && callback();
    });
  }
}

module.exports = ReactSSRDynamicChunkPlugin;
