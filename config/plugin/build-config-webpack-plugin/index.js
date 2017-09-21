'use strict';
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

class BuildConfigPlugin {
  constructor(opts) {
    this.opts = Object.assign(opts, {
      filepath: 'config/buildConfig.json'
    });
  }

  save(filepath, content) {
    try {
      mkdirp.sync(path.dirname(filepath));
      fs.writeFileSync(filepath, typeof content === 'string' ? content : JSON.stringify(content), 'utf8');
    } catch (e) {
      console.error(`writeFile ${filepath} err`, e);
    }
  }

  apply(compiler) {
    const filepath = path.isAbsolute(this.opts.filepath) ? this.opts.filepath : path.join(this.opts.baseDir, this.opts.filepath);
    const content = {
      buildPath: this.opts.buildPath.replace(this.opts.baseDir, '').replace(/^\//, ''),
      publicPath: this.opts.proxy && this.opts.host ? this.opts.publicPath.replace(this.opts.host, '') : this.opts.publicPath,
      commonsChunk: this.opts.commonsChunk
    };
    this.save(filepath, content);
  }
}

module.exports = BuildConfigPlugin;
