'use strict';
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const utils = {};

utils.isFunction = value => typeof value === 'function';

utils.isObject = value => typeof value === 'object';

utils.isString = value => typeof value === 'string';

utils.isBoolean = value => typeof value === 'boolean';

utils.normalizePath = (filepath, baseDir) => path.isAbsolute(filepath) ? filepath : path.join(baseDir, filepath);

utils.joinPath = function() {
  return [].slice.call(arguments, 0).map((arg, index) => {
    let tempArg = arg.replace(/\/$/, '');
    if (index > 0) {
      tempArg = arg.replace(/^\//, '');
    }
    return tempArg;
  }).join('/');
};

utils.createEntry = (config, type) => {
  const configEntry = config.entry;
  if (configEntry && configEntry.include) {
    const entryDirs = Array.isArray(configEntry.include) ? configEntry.include : [configEntry.include];
    const normalizeEntryDirs = entryDirs.map(entryDir => utils.normalizePath(entryDir, config.baseDir));
    const entryLoader = configEntry.loader && configEntry.loader[type];
    return utils.getEntry(normalizeEntryDirs, configEntry.exclude, configEntry.extMatch, entryLoader);
  }
  return {};
};

utils.getEntry = (dirs, excludeRegex, extMatch = '.js', entryLoader) => {
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
          if (filePath.endsWith(extMatch)) {
            const fileName = filePath.replace(entryDir, '').replace(/^\//, '').replace(/\.js$/, '');
            if (entryLoader) {
              entries[fileName] = ['babel-loader', entryLoader, filePath].join('!');
            } else {
              entries[fileName] = filePath;
            }
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


utils.loadNodeModules = () => {
  const nodeModules = {};

  fs.readdirSync('node_modules').filter(x => ['.bin'].indexOf(x) === -1).forEach(mod => {
    nodeModules[mod] = `commonjs2 ${mod}`;
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
