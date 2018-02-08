'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const url = require('url');
const queryString = require('querystring');
const mkdirp = require('mkdirp');
const cloneDeep = require('lodash.clonedeep');
const cloneDeepWith = require('lodash.clonedeepwith');
const install = require('./install');
const utils = Object.assign({}, {
  cloneDeep,
  cloneDeepWith,
  mkdirp,
  queryString
}, install);

utils.has = value => {
  return value !== undefined;
};

utils.isFunction = value => typeof value === 'function';

utils.isObject = value => typeof value === 'object';

utils.isString = value => typeof value === 'string';

utils.isBoolean = value => typeof value === 'boolean';

utils.normalizePath = (filepath, baseDir) => path.isAbsolute(filepath) ? filepath : path.join(baseDir, filepath);

utils.normalizeBuildPath = (buildPath, baseDir) => {
  return utils.normalizePath(buildPath, baseDir);
};


utils.isHttpOrHttps = strUrl => {
  return /^(https?:|\/\/)/.test(strUrl);
};

utils.normalizePublicPath = publicPath => {
  publicPath = `${publicPath.replace(/\/$/, '')}/`;
  if (!utils.isHttpOrHttps(publicPath) && !/^\//.test(publicPath)) {
    publicPath = `/${publicPath}`;
  }
  return publicPath;
};

utils.isTrue = value => value !== 'false' && (!!value || value === undefined);

utils.mixin = (target, source) => {
  const mixinProperty = utils.isObject(source) ? Object.getOwnPropertyNames(source) : Object.getOwnPropertyNames(source.prototype);
  mixinProperty.forEach(property => {
    if (property !== 'constructor') {
      target[property] = source.prototype[property];
    }
  });
};
utils.joinPath = function() {
  return [].slice.call(arguments, 0).map((arg, index) => {
    let tempArg = arg.replace(/\/$/, '');
    if (index > 0) {
      tempArg = arg.replace(/^\//, '');
    }
    return tempArg;
  }).join('/');
};

utils.getEntry = (config, type) => {
  let entryArray = [];
  let entryLoader;
  let extMatch = '.js';
  const configEntry = config.entry;
  const entries = {};
  if (configEntry && configEntry.include) {
    entryLoader = type && configEntry.loader && configEntry.loader[type];
    if (entryLoader) {
      entryLoader = utils.normalizePath(entryLoader, config.baseDir);
    }
    const extMapping = { vue: '.vue', react: '.jsx', weex: '.vue' };
    extMatch = entryLoader ? configEntry.extMatch || extMapping[config.framework] : configEntry.extMatch;
    entryArray = Array.isArray(configEntry.include) ? configEntry.include : [configEntry.include];
  } else {
    entryArray.push(configEntry);
  }
  entryArray.forEach(entry => { // ['app/web/page', { 'app/app': 'app/web/page/app/app.js?loader=false' }],
    if (utils.isString(entry)) { // isDirectory
      const filepath = utils.normalizePath(entry, config.baseDir);
      if (fs.statSync(filepath).isDirectory()) {
        const dirEntry = utils.walkFile(filepath, configEntry.exclude, extMatch, config.baseDir);
        Object.assign(entries, utils.createEntry(config, entryLoader, dirEntry, true));
      } else {
        const entryName = path.basename(filepath, path.extname(filepath));
        const singleEntry = {};
        singleEntry[entryName] = filepath;
        Object.assign(entries, utils.createEntry(config, entryLoader, singleEntry, true));
      }
    } else if (entry instanceof RegExp) {
      const dirEntry = utils.walkFile(entry, configEntry.exclude, extMatch, config.baseDir);
      Object.assign(entries, utils.createEntry(config, entryLoader, dirEntry, false));
    } else if (utils.isObject(entry)) {
      Object.assign(entries, utils.createEntry(config, entryLoader, entry, true));
    }
  });
  return entries;
};


utils.createEntry = (config, entryLoader, entryConfig, isParseUrl) => {
  const entries = {};
  const baseDir = config.baseDir;
  Object.keys(entryConfig).forEach(entryName => {
    let targetFile = entryConfig[entryName];
    let useLoader = !!entryLoader;
    if (isParseUrl && utils.isString(targetFile)) {
      const fileInfo = url.parse(targetFile);
      const params = queryString.parse(fileInfo.query);
      useLoader = utils.isTrue(params.loader);
      targetFile = targetFile.split('?')[0];
      targetFile = path.normalize(targetFile);
      targetFile = utils.normalizePath(targetFile, baseDir);
    }
    if (entryLoader && useLoader && utils.isString(targetFile)) {
      entries[entryName] = ['babel-loader', entryLoader, targetFile].join('!');
    } else {
      entries[entryName] = targetFile;
    }
  });
  return entries;
};

utils.getDirByRegex = (regex, baseDir) => {
  const strRegex = String(regex).replace(/^\//, '').replace(/\/$/, '').replace(/\\/g, '');
  const entryDir = strRegex.split('\/').reduce((dir, item) => {
    if (/^[A-Za-z0-9]*$/.test(item)) {
      return dir ? `${dir}/${item}` : item;
    }
    return dir;
  }, '');
  assert(entryDir, `The regex ${strRegex} must begin with / + a letter or number`);
  return utils.normalizePath(entryDir, baseDir);
};

utils.walkFile = (dirs, excludeRegex, extMatch = '.js', baseDir) => {
  const entries = {};
  let entryDir = '';
  const walk = (dir, include, exclude) => {
    const dirList = fs.readdirSync(dir);
    dirList.forEach(item => {
      const filePath = path.posix.join(dir, item);
      // console.log('----walkFile', entryDir, filePath);
      if (fs.statSync(filePath).isDirectory()) {
        walk(filePath, include, exclude);
      } else if (include.length > 0 && utils.isMatch(include, filePath) && !utils.isMatch(exclude, filePath) || include.length === 0 && !utils.isMatch(exclude, filePath)) {
        if (filePath.endsWith(extMatch)) {
          const entryName = filePath.replace(entryDir, '').replace(/^\//, '').replace(extMatch, '');
          entries[entryName] = filePath;
        }
      }
    });
  };

  const includeRegex = [];
  if (dirs instanceof RegExp) {
    includeRegex.push(dirs);
    dirs = utils.getDirByRegex(dirs, baseDir);
  }
  dirs = Array.isArray(dirs) ? dirs : [dirs];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      entryDir = dir;
      walk(dir, includeRegex, excludeRegex);
    }
  });
  return entries;
};

utils.isMatch = (regexArray, strMatch) => {
  if (!regexArray) {
    return false;
  }
  regexArray = Array.isArray(regexArray) ? regexArray : [regexArray];
  return regexArray.some(item => new RegExp(item, '').test(strMatch));
};

utils.assetsPath = (prefix, filepath) => path.posix.join(prefix, filepath);

utils.getLoaderLabel = loader => {
  let loaderName = loader;
  if (utils.isObject(loader)) {
    if (loader.loader) {
      loaderName = loader.loader;
    } else if (Array.isArray(loader.use)) {
      loaderName = loader.use.reduce((name, item) => {
        if (utils.isString(item)) {
          name += item;
        } else {
          name += item.loader;
        }
        return name;
      }, '');
    }
  }
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
  if (port) {
    const ip = utils.getIp();
    return `http://${ip}:${port}`;
  }
  return '';
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

utils.getVersion = (name, baseDir) => {
  const pkgFile = path.join(baseDir, 'node_modules', name, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkgJSON = require(pkgFile);
    return pkgJSON.version;
  }
  return null;
};

utils.getCompileTempDir = (filename = '', baseDir) => {
  const pkgfile = path.join(baseDir || process.cwd(), 'package.json');
  const pkg = require(pkgfile);
  const project = pkg.name;
  return `${os.tmpdir()}/easywebpack/${project}/${filename}`;
};

utils.getDllFilePath = (name, env = 'dev') => {
  return utils.getCompileTempDir(`${env}/dll/manifest-${name}-dll.json`);
};

utils.getDllConfig = dll => {
  if (utils.isString(dll)) {
    return [{ name: 'vendor', lib: [dll] }];
  } else if (utils.isObject(dll) && dll.name && dll.lib) {
    return [dll];
  } else if (Array.isArray(dll) && dll.length && utils.isString(dll[0])) {
    return [{ name: 'vendor', lib: dll }];
  } else if (Array.isArray(dll) && dll.length && utils.isObject(dll[0]) && dll[0].name) {
    return dll;
  }
  return [];
};

utils.getDllCacheInfoPath = (name, env = 'dev') => {
  return utils.getCompileTempDir(`${env}/dll/cache-${name}.json`);
};

utils.getCacheInfoPath = () => {
  return utils.getCompileTempDir('config.json');
};

utils.getModuleInfo = (module, baseDir) => {
  if (/\.js$/.test(module)) {
    if (fs.existsSync(module)) {
      const stat = fs.statSync(module);
      return stat.mtimeMs;
    }
    const moduleFile = path.join(baseDir, 'node_modules', module);
    const stat = fs.statSync(moduleFile);
    return stat.mtimeMs;
  }
  const pkgFile = path.join(baseDir, 'node_modules', module, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkgJSON = require(pkgFile);
    return pkgJSON.version;
  }
  const moduleIndexFile = path.join(baseDir, 'node_modules', module, 'index.js');
  if (fs.existsSync(moduleIndexFile)) {
    const stat = fs.statSync(moduleIndexFile);
    return stat.mtimeMs;
  }
  return module;
};

utils.saveDllCacheInfo = (config, webpackConfigFile, dllCachePath, webpackDllInfo, webpackConfigFileLastModifyTime) => {
  const webpackDllLibInfo = {};
  webpackDllInfo.lib.forEach(module => {
    const info = utils.getModuleInfo(module, config.baseDir);
    webpackDllLibInfo[module] = info;
  });
  utils.writeFile(dllCachePath, {
    webpackDllInfo,
    webpackDllLibInfo,
    webpackConfigFile,
    webpackConfigFileLastModifyTime
  });
};

utils.getDllCacheInfo = dllCachePath => {
  if (fs.existsSync(dllCachePath)) {
    return require(dllCachePath);
  }
  return null;
};

utils.checkDllUpdate = (config, dll) => {
  const baseDir = config.baseDir;
  const filepath = config.webpackConfigFile ? config.webpackConfigFile : path.join(baseDir, 'webpack.config.js');
  if (!fs.existsSync(filepath)) {
    return true;
  }
  const stat = fs.statSync(filepath);
  const lastModifyTime = stat.mtimeMs;
  const dllCachePath = utils.getDllCacheInfoPath(dll.name, config.env);
  // cache file 文件不存在
  if (!fs.existsSync(dllCachePath)) {
    utils.saveDllCacheInfo(config, filepath, dllCachePath, dll, lastModifyTime);
    return true;
  }
  // dll manifest 文件不存在
  if (!fs.existsSync(utils.getDllFilePath(dll.name, config.env))) {
    return true;
  }
  // 判断 webpack.config.js 修改时间
  const dllCacheInfo = utils.getDllCacheInfo(dllCachePath);
  if (dllCacheInfo) {
    if (dllCacheInfo.webpackConfigFileLastModifyTime !== lastModifyTime) {
      utils.saveDllCacheInfo(config, filepath, dllCachePath, dll, lastModifyTime);
      return true;
    }
    // 判断 module 版本是否有升级, 目前只判断主module, module 依赖变更的暂不支持
    const webpackDllLibInfo = dllCacheInfo.webpackDllLibInfo;
    return dll.lib.some(module => {
      const info = utils.getModuleInfo(module, config.baseDir);
      if (webpackDllLibInfo[module] !== info) {
        utils.saveDllCacheInfo(config, filepath, dllCachePath, dll, lastModifyTime);
        return true;
      }
      return false;
    });
  }
  return false;
};

module.exports = utils;
