'use strict';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const mkdirp = require('mkdirp');
const utils = {};

utils.getEntry = (dirs, excludeRegex) => {
  const entries = {};
  let entryDir = '';
  const walk = (dir, exclude) => {
    const dirList = fs.readdirSync(dir);
    dirList.forEach(item => {
      const filePath = path.join(dir, item);
      if (fs.statSync(filePath).isDirectory()) {
        walk(filePath, exclude);
      } else {
        if (!utils.isMatch(exclude, filePath)) {
          if (/\.js$/.test(filePath)) {
            const fileName = filePath.replace(entryDir, '').replace(/^\//, '').replace(/\.js$/, '');
            entries[fileName] = filePath;
          }
        }
      }
    });
  };
  dirs = Array.isArray(dirs) ? dirs : [dirs];
  dirs.forEach(dir => {
    entryDir = dir;
    walk(dir, excludeRegex);
  });
  return entries;
};

utils.isMatch = (regexArray, strMatch) => {
  if (!regexArray || !regexArray.length) return false;
  return regexArray.some(item => {
    return new RegExp(item, '').test(strMatch);
  });
};


utils.assetsPath = (config, filepath) => {
  return path.join(config.build.prefix, filepath);
};


utils.loadNodeModules = () => {
  const nodeModules = {};
  fs.readdirSync('node_modules').filter(x => {
    return ['.bin'].indexOf(x) === -1;
  }).forEach(mod => {
    nodeModules[mod] = 'commonjs2 ' + mod;
  });
  return nodeModules;
};

utils.readWebpackMemoryFile = (compiler, filePath) => {
  const filerCompiler = compiler.compilers.filter(item => {
    return item.outputFileSystem.existsSync(filePath);
  });
  if (filerCompiler && filerCompiler.length) {
    return filerCompiler[0].outputFileSystem.readFileSync(filePath).toString('utf-8');
  }
  return '';
};

utils.getCompilerPublicPath = (compiler, filePath) => {
  const filerCompiler = compiler.compilers.filter(item => {
    return item.outputFileSystem.existsSync(filePath);
  });
  if (filerCompiler && filerCompiler.length) {
    return filerCompiler[0].output.publicPath;
  }
  return '';
};

utils.getIp = position => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const ips = [];
  if (interfaces.en0) {
    for (let i = 0; i < interfaces.en0.length; i++) {
      if (interfaces.en0[i].family === 'IPv4') {
        ips.push(interfaces.en0[i].address);
      }
    }
  }
  if (interfaces.en1) {
    for (let i = 0; i < interfaces.en1.length; i++) {
      if (interfaces.en1[i].family === 'IPv4') {
        ips.push(interfaces.en1[i].address);
      }
    }
  }
  if (position > 0 && position <= ips.length) {
    return ips[position - 1];
  } else if (ips.length) {
    return ips[0];
  }
  return '127.0.0.1';

};

utils.getHost = (config, position, isServer) => {
  const ip = utils.getIp(position);
  return `http://${ip}:${isServer ? config.build.port + 1 : config.build.port}`;
};

utils.getDevPublicPath = (config, position) => {
  return utils.getHost(config, position) + config.build.publicPath;
};

utils.getUglifyJsConfig = (config = {}, options) => {
  return new webpack.optimize.UglifyJsPlugin(merge({
    compress: {
      warnings: false,
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      global_defs: options.globalDefs
    }
  }, config.uglifyJsConfig));
};

utils.writeFile = (dir, fileName, content) => {
  try {
    mkdirp.sync(dir);
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, typeof content === 'string' ? content : JSON.stringify(content), 'utf8');
  } catch (e) {
    console.error(`writeFile ${dir}/${fileName} err`, e);
  }
};

utils.readFile = (dir, fileName) => {
  const filePath = path.join(dir, fileName);
  try {
    if (fs.existsSync(dir)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    /* istanbul ignore next */
  }
  return null;
};

utils.getPublicPath = (webpackConfig, config, env) => {
  let publicPath = webpackConfig.output.publicPath;
  if (env !== 'dev' && config.build.cdnDynamicDir && /^(https?|\/\/)/.test(publicPath)) {
    publicPath = publicPath.replace(/\/$/, '') + '/' + config.build.cdnDynamicDir + '/';
  }
  return publicPath;
};

utils.saveBuildConfig = (config, webpackConfig, env) => {
  utils.writeFile(config.baseDir, 'config/buildConfig.json', {
    publicPath: utils.getPublicPath(webpackConfig, config, env),
    cdnDynamicDir: config.build.cdnDynamicDir,
    commonsChunk: config.build.commonsChunk
  });
};

utils.saveManifest = (compiler, projectDir) => {
  const dir = path.join(projectDir, 'config');
  const fileName = 'manifest.json';
  const content = utils.readWebpackMemoryFile(compiler, path.join(dir, fileName));
  utils.writeFile(dir, fileName, content);
};

utils.getBuildConfig = dir => {
  return utils.readFile(dir, 'config/buildConfig.json');
};

module.exports = utils;
