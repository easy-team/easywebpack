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
  return path.posix.join(config.build.prefix, filepath);
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

utils.writeFile = (filepath, content) => {
  try {
    mkdirp.sync(path.dirname(filepath));
    fs.writeFileSync(filepath, typeof content === 'string' ? content : JSON.stringify(content), 'utf8');
  } catch (e) {
    console.error(`writeFile ${filepath} err`, e);
  }
};

utils.readFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    /* istanbul ignore next */
  }
  return null;
};

utils.getPublicPath = (config, webpackConfig) => {
  let publicPath = webpackConfig.output.publicPath;
  if (config.env !== 'dev' && config.build.cdnDynamicDir && /^(https?|\/\/)/.test(publicPath)) {
    publicPath = publicPath.replace(/\/$/, '') + '/' + config.build.cdnDynamicDir + '/';
  }
  return publicPath;
};

utils.saveBuildConfig = (config, webpackConfig) => {
  const filepath = path.join(config.baseDir, 'config/buildConfig.json');
  utils.writeFile(filepath, {
    publicPath: utils.getPublicPath(config, webpackConfig),
    cdnDynamicDir: config.build.cdnDynamicDir,
    commonsChunk: config.build.commonsChunk
  });
};

utils.saveManifestFile = (filepath, content) => {
  const manifest = typeof content === 'string' ? JSON.parse(content) : content;
  const normalizeManifest = utils.normalizeManifest(manifest);
  utils.writeFile(filepath, normalizeManifest);
};

utils.normalizeManifestFile = (filepath) => {
  const manifest = utils.readFile(filepath);
  if (manifest) {
    utils.saveManifestFile(filepath, manifest);
  }
};

utils.normalizeManifest = (manifest) => {
  const normalizeManifest = {};
  Object.keys(manifest).forEach(key => {
    const normalizeKey = key.replace(/^\\/g, '').replace(/\\/g, '/');
    const normalizeValue = manifest[key].replace(/\\/g, '/').replace(/\/\//g, '/');
    normalizeManifest[normalizeKey] = normalizeValue;
  });
  return normalizeManifest;
};

module.exports = utils;
