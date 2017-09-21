'use strict';
const path = require('path');
const fs = require('fs');
const url = require('url');
const queryString = require('querystring');
const mkdirp = require('mkdirp');
const cloneDeep = require('lodash.clonedeep');
const install = require('./install');
const utils = Object.assign({}, {
  cloneDeep,
  mkdirp,
  queryString
}, install);

utils.isFunction = value => typeof value === 'function';

utils.isObject = value => typeof value === 'object';

utils.isString = value => typeof value === 'string';

utils.isBoolean = value => typeof value === 'boolean';

utils.normalizePath = (filepath, baseDir) => path.isAbsolute(filepath) ? filepath : path.join(baseDir, filepath);

utils.isTrue = value => value !== 'false' && (!!value || value === undefined);

utils.mixin = (target, source) => {
  const mixinProperty = utils.isObject(source) ? Object.getOwnPropertyNames(source) : Object.getOwnPropertyNames(source.prototype);
  mixinProperty.forEach(property => {
    if (property !== 'constructor') {
      target[property] = source.prototype[property];
    }
  });
};
utils.joinPath = function () {
  return [].slice.call(arguments, 0).map((arg, index) => {
    let tempArg = arg.replace(/\/$/, '');
    if (index > 0) {
      tempArg = arg.replace(/^\//, '');
    }
    return tempArg;
  }).join('/');
};

utils.getEntry = (config, type) => {
  const configEntry = config.entry;
  const entries = {};
  if (configEntry && configEntry.include) {
    let entryLoader = configEntry.loader && configEntry.loader[type];
    if (entryLoader) {
      entryLoader = utils.normalizePath(entryLoader, config.baseDir);
    }
    if (Array.isArray(configEntry.include) || utils.isString(configEntry.include)) {
      const entryArray = Array.isArray(configEntry.include) ? configEntry.include : [configEntry.include];
      entryArray.forEach(entry => { // ['app/web/page', { 'app/app': 'app/web/page/app/app.js?loader=false' }],
        if (utils.isString(entry)) { // isDirectory
          const filepath = utils.normalizePath(entry, config.baseDir);
          if (fs.statSync(filepath).isDirectory()) {
            const extMapping = { vue: '.vue', react: '.jsx', weex: '.vue' };
            const walkExt = entryLoader ? configEntry.extMatch || extMapping[config.framework] : configEntry.extMatch;
            const dirEntry = utils.walkFile(filepath, configEntry.exclude, walkExt);
            Object.assign(entries, utils.createEntry(config.baseDir, entryLoader, dirEntry));
          }
        } else if (utils.isObject(entry)) {
          Object.assign(entries, utils.createEntry(config.baseDir, entryLoader, entry, true));
        }
      });
    } else if (utils.isObject(configEntry.include)) { // { 'app/app': 'app/web/page/app/app.js?loader=false', 'home/home': 'app/web/page/home/home.js' }
      Object.assign(entries, utils.createEntry(config.baseDir, entryLoader, configEntry.include, true));
    }
  }
  return entries;
};


utils.createEntry = (baseDir, entryLoader, entryConfig, isParseUrl) => {
  const entries = {};
  Object.keys(entryConfig).forEach(entryName => {
    let filepath = entryConfig[entryName];
    let useLoader = !!entryLoader;
    if (isParseUrl) {
      const fileInfo = url.parse(filepath);
      const params = queryString.parse(fileInfo.query);
      useLoader = utils.isTrue(params.loader);
      filepath = utils.normalizePath(fileInfo.pathname, baseDir);
    }
    if (useLoader) {
      entries[entryName] = ['babel-loader', entryLoader, filepath].join('!');
    } else {
      entries[entryName] = filepath;
    }
  });
  return entries;
};


utils.walkFile = (dirs, excludeRegex, extMatch = '.js') => {
  const entries = {};
  let entryDir = '';
  const walk = (dir, exclude) => {
    const dirList = fs.readdirSync(dir);
    dirList.forEach(item => {
      const filePath = path.posix.join(dir, item);
      // console.log('----walkFile', entryDir, filePath);
      if (fs.statSync(filePath).isDirectory()) {
        walk(filePath, exclude);
      } else {
        if (!utils.isMatch(exclude, filePath)) {
          if (filePath.endsWith(extMatch)) {
            const entryName = filePath.replace(entryDir, '').replace(/^\//, '').replace(extMatch, '');
            entries[entryName] = filePath;
          }
        }
      }
    });
  };

  dirs = Array.isArray(dirs) ? dirs : [dirs];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      entryDir = dir;
      walk(dir, excludeRegex);
    }
  });
  return entries;
};

utils.isMatch = (regexArray, strMatch) => {
  if (!regexArray || !regexArray.length) {
    return false;
  }
  return regexArray.some(item => new RegExp(item, '').test(strMatch));
};


utils.assetsPath = (prefix, filepath) => path.posix.join(prefix, filepath);

utils.getLoaderLabel = loader => {
  const loaderName = utils.isObject(loader) ? loader.loader : loader;
  return loaderName.replace(/-loader$/, '').replace(/-/g, '');
};

utils.loadNodeModules = isCache => {
  const nodeModules = {};
  const cacheFile = path.join(__dirname, '../temp/cache.json');
  if (isCache && fs.existsSync(cacheFile)) {
    return require(cacheFile);
  }
  fs.readdirSync('node_modules').filter(x => ['.bin'].indexOf(x) === -1).forEach(mod => {
    nodeModules[mod] = `commonjs2 ${mod}`;
  });
  if (isCache) {
    utils.writeFile(cacheFile, nodeModules);
  }
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

utils.getHost = port => {
  const ip = utils.getIp();
  return `http://${ip}:${port}`;
};

utils.writeFile = (filepath, content) => {
  try {
    mkdirp.sync(path.dirname(filepath));
    fs.writeFileSync(filepath, typeof content === 'string' ? content : JSON.stringify(content), 'utf8');
  } catch (e) {
    console.error(`writeFile ${filepath} err`, e);
  }
};

utils.readFile = filepath => {
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


utils.saveBuildConfig = (filepath, buildConfig) => {
  utils.writeFile(filepath, buildConfig);
};

module.exports = utils;