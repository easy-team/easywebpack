'use strict';
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
const WebpackDllBuilder = require('./target/dll');
const utils = require('../utils/utils');
const BASE_SOLUTION = 'easywebpack';
const EASY_BASE_SOLUTION = '@easy-team/easywebpack';
const BASE_FRAMEWORKS = ['vue', 'react', 'weex', 'html', 'js'];

exports.getFramework = baseDir => {
  const pkgFile = path.join(baseDir, 'package.json');
  const pkg = require(pkgFile);
  return BASE_FRAMEWORKS.find(framework => {
    const key = `${BASE_SOLUTION}-${framework}`;
    const ver = pkg.dependencies[key] || pkg.devDependencies[key];
    if (ver) {
      return true;
    }
    const easyKey = `${EASY_BASE_SOLUTION}-${framework}`;
    return pkg.dependencies[easyKey] || pkg.devDependencies[easyKey];
  });
};

exports.getTarget = config => {
  if (config.target) {
    return config.target;
  }
  if (config.type === 'client' || config.framework === 'html' || config.template) {
    return 'web';
  }
  if (config.target === null || utils.isEgg(config)) {
    return undefined;
  }
  return 'web';
};

exports.getPackageConfig = baseDir => {
  const pkgFile = path.join(baseDir, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = require(pkgFile);
    return merge({ baseDir }, pkg.webpack);
  }
  return { baseDir };
};

exports.mergeConfig = (a = {}, b = {}) => {
  if (Array.isArray(a.plugins) && utils.isObject(b.plugins)) {
    b.plugins = Object.keys(b.plugins).map(key => {
      return {
        [key]: b.plugins[key]
      };
    });
  }
  if (Array.isArray(b.plugins) && utils.isObject(a.plugins)) {
    a.plugins = Object.keys(a.plugins).map(key => {
      return {
        [key]: a.plugins[key]
      };
    });
  }
  return merge(a, b);
};

exports.getBuilderConfig = (config = {}, option = {}) => {
  const { baseDir = process.cwd() } = option;
  const pkgConfig = exports.getPackageConfig(baseDir);
  const baseConfig = exports.mergeConfig(pkgConfig, option);
  if (utils.isObject(config)) {
    const defaultWebpackFilepath = path.join(config.baseDir || baseDir, 'webpack.config.js');
    if (fs.existsSync(defaultWebpackFilepath)) {
      const fileConfig = require(defaultWebpackFilepath);
      const normalizeFileConfig = exports.mergeConfig(baseConfig, fileConfig);
      return exports.mergeConfig(normalizeFileConfig, config);
    }
  } else if (utils.isString(config)) {
    const filepath = path.isAbsolute(config) ? config : path.resolve(baseDir, config);
    if (fs.existsSync(filepath)) {
      const customFileConfig = require(filepath);
      return exports.mergeConfig(baseConfig, customFileConfig);
    }
  }
  return exports.mergeConfig(baseConfig, config);
};

// create dll manifest
exports.getDllWebpackConfig = (config, option = {}) => {
  config.baseDir = config.baseDir || process.cwd();
  if (config.dll) {
    const dll = WebpackDllBuilder.getDllConfig(config.dll);
    const cli = utils.isObject(config.cli) ? config.cli : {};
    const webpackConfigList = [];
    const plugins = [];
    if (cli.size) {
      plugins.push(cli.size === true ? { analyzer: true } : { stats: true });
    }
    // need dll customize uglifyJs config
    const uglifyJs = utils.getConfigPlugin(config.plugins, 'uglifyJs');
    if (uglifyJs) {
      plugins.push({ uglifyJs });
    }
    dll.forEach(item => {
      const tmpConfig = utils.cloneDeep(config);
      const dllConfig = merge(tmpConfig, { entry: null, dll: null, plugins }, { dll: item }, item.webpackConfig);
      if (option.onlyView || cli.dll || utils.checkDllUpdate(config, item)) {
        webpackConfigList.push(new WebpackDllBuilder(dllConfig).create());
      }
    });
    if (webpackConfigList.length) {
      return webpackConfigList.length === 1 ? webpackConfigList[0] : webpackConfigList;
    }
  } else {
    console.warn(`${chalk.red('[easywebpack] webpack config no dll config, please check webpack.config.js file config')}`);
  }
  return null;
};

exports.getConfig = (config, option) => {
  const easyConfig = exports.getBuilderConfig(config, option);
  // 自动检测动态设置 framework, 支持 vue,react,html,weex,js
  easyConfig.framework = easyConfig.framework || exports.getFramework(easyConfig.baseDir);
  easyConfig.target = exports.getTarget(easyConfig);
  return easyConfig;
};

exports.getWebpackConfig = (config, builders, option = {}) => {
  let configured = utils.isObject(config) && config.configured;
  if (configured === undefined) {
    configured = utils.isObject(config) && utils.isObject(config.cli);
  }
  const easyConfig = configured ? config : exports.getConfig(config, option);
  const type = easyConfig.type;
  const target = easyConfig.target || option && option.target;
  let webpackConfigList = [];
  if (option.onlyDll) {
    return exports.getDllWebpackConfig(easyConfig, option);
  }
  if (option.dll) {
    const dllWebpackConfig = exports.getDllWebpackConfig(easyConfig);
    if (dllWebpackConfig) {
      webpackConfigList = webpackConfigList.concat(dllWebpackConfig);
    }
  }
  builders = Array.isArray(builders) ? builders : [builders];
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    // console.log('easywebpack.getWebpackConfig:',WebpackBuilder.TYPE, WebpackBuilder.TARGET, target, type);
    if ((type === undefined && (target === undefined || target === null)) || WebpackBuilder.TYPE === type ||
    WebpackBuilder.TARGET === target || (Array.isArray(type) && type.includes(WebpackBuilder.TYPE))) {
      webpackConfigList.push(new WebpackBuilder(easyConfig).create());
    }
  });
  return webpackConfigList.length === 1 ? webpackConfigList[0] : webpackConfigList;
};
