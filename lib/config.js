'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const utils = require('../utils/utils');
const Logger = require('../utils/logger');

class Config {
  constructor(config) {
    const self = this;
    this.webpack = webpack;
    this.merge = merge;
    this.utils = utils;
    this.packs = {};
    this.configInfo = {};
    this.initialized = false;
    this.startCreateQueue = [];
    this.beforeCreateQueue = [];
    this.baseDir = config.baseDir || process.cwd();
    this.logger = new Logger(config.logger, this);
    this.baseConfig = new Proxy({}, {
      set(target, key, value, proxy) {
        if (self.initialized && self._config) {
          if(self.configInfo.hasOwnProperty(key)){
            self._config[key] = self.safeMerge(value, self.configInfo[value]);
          }else{
            self._config[key] = value;
          }
        }
        return Reflect.set(target, key, value, proxy);
      }
    });
    this.initConfig(config);
  }

  get config() {
    if (!this._config) {
      this._config = this.safeMerge(this.baseConfig, this.configInfo);
    }
    return this._config;
  }

  initConfig(config) {
    this.configInfo = this.initConfigInfo(config);
    this.configLoaders = this.utils.cloneDeep(config.loaders);
    this.configPlugins = this.utils.cloneDeep(config.plugins);
    this.webpackConfig = this.utils.cloneDeep(require('../config/webpack'));
    this.loaders = this.utils.cloneDeep(require('../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../config/plugin'));
    const defaultPkg = require('../package.json');
    const projectPkg = require(path.join(this.baseDir, 'package.json'));
    this.dependencies = this.utils.getDeps(projectPkg.devDependencies, defaultPkg.fullDependencies);
  }

  initConfigInfo(config) {
    const configInfo = {};
    Object.keys(config).forEach(key => {
      if (key !== 'loaders' && key !== 'plugins') {
        configInfo[key] = config[key];
      }
    });
    return configInfo;
  }

  safeMerge(value, newValue) {
    if (this.utils.isObject(value)) {
      return this.merge(value, newValue);
    } else {
      return newValue;
    }
  }

  createFileName() {
    const prefix = this.config.prefix;
    if (this.config.fileHash) {
      this.setOutputFileName(utils.assetsPath(prefix, `js/[name].[chunkhash:${this.config.hashLength}].js`));
      this.setOutputFileChunkName(utils.assetsPath(prefix, `js/chunk/[name].[chunkhash:${this.config.hashLength}].js`))
    } else {
      this.setOutputFileName(utils.assetsPath(prefix, 'js/[name].js'));
      this.setOutputFileChunkName(utils.assetsPath(prefix, 'js/chunk/[name].js'));
    }
  }

  createImageName() {
    const prefix = this.config.prefix;
    if (this.config.imageHash) {
      this.baseConfig.imageName = utils.assetsPath(prefix, `img/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.baseConfig.imageName = utils.assetsPath(prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    const prefix = this.config.prefix;
    if (this.config.cssHash) {
      this.baseConfig.cssName = utils.assetsPath(prefix, `css/[name].[contenthash:${this.config.hashLength}].css`);
    } else {
      this.baseConfig.cssName = utils.assetsPath(prefix, 'css/[name].css');
    }
  }

  createFrontName() {
    const prefix = this.config.prefix;
    if (this.config.fontHash) {
      this.baseConfig.frontName = utils.assetsPath(prefix, `font/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.baseConfig.frontName = utils.assetsPath(prefix, 'font/[name].[ext]');
    }
  }


  setPrefix(prefix) {
    this.baseConfig.prefix = prefix;
  }

  setExtensions(extension) {
    if (extension) {
      const extensions = this.webpackConfig.resolve && this.webpackConfig.resolve.extensions || [];
      const newExtensions = Array.isArray(extension) ? extension : [extension];
      newExtensions.forEach(ext => {
        if (!extensions.includes(ext)) {
          extensions.push(ext);
        }
      });
      this.webpackConfig.resolve.extensions = extensions;
    }
  }

  setTarget(target) {
    this.webpackConfig.target = target;
  }

  setLibrary(library) {
    this.webpackConfig.output.library = library;
  }

  setLibraryTarget(libraryTarget) {
    this.webpackConfig.output.libraryTarget = libraryTarget;
  }

  setNode(node) {
    this.webpackConfig.node = node;
  }

  setOutputPath(path) {
    this.buildPath = path;
    this.baseConfig.path = path;
    this.webpackConfig.output.path = path;
  }

  setOutputPublicPath(publicPath) {
    this.publicPath = publicPath;
    this.baseConfig.publicPath = this.publicPath;
    this.webpackConfig.output.publicPath = publicPath;
  }

  setOutputFileName(value) {
    this.webpackConfig.output.filename = value;
  }

  setOutputFileChunkName(value) {
    this.webpackConfig.output.chunkFilename = value;
  }

  setResolveLoader(resolveLoader) {
    this.webpackConfig.resolveLoader = this.merge(this.webpackConfig.resolveLoader, { resolveLoader });
  }

  setExternals(externals) {
    this.webpackConfig.externals = this.merge(this.webpackConfig.externals, { externals });
  }

  setAlias(name = {}, value, useBaseDir = true) {
    if (this.utils.isObject(name)) {
      Object.keys(name).forEach(key => {
        this.setAlias(key, name[key]);
      });
    } else {
      const alias = {};
      alias[name] = useBaseDir ? this.utils.normalizePath(value, this.baseDir) : value;
      this.webpackConfig.resolve.alias = this.merge(this.webpackConfig.resolve.alias, alias);
    }
  }

  setHot(hot) {
    this.mergePlugin({ hot });
  }

  setDefine(define, value) {
    if (value !== undefined) {
      const args = {};
      args[define] = value;
      define = args;
    }
    this.mergePlugin({ define });
  }

  setMiniImage(imagemini) {
    this.mergePlugin({ imagemini });
  }

  setMiniJs(uglifyJs) {
    this.mergePlugin({ uglifyJs });
  }

  setMiniCss(miniCss) {
    this.loaders.options = this.merge(this.loaders.options, {
      css: {
        options: {
          minimize: this.utils.isTrue(miniCss)
        }
      }
    });
  }

  setHashLength(len = 8) {
    this.baseConfig.hashLength = len;
  }

  setFileNameHash(isHash) {
    this.baseConfig.fileHash = isHash;
  }

  setImageHash(isHash) {
    this.baseConfig.imageHash = isHash;
  }

  setFontHash(isHash) {
    this.baseConfig.fontHash = isHash;
  }

  setCssHash(isHash) {
    this.baseConfig.cssHash = isHash;
  }

  setEntry(entry) {
    this.baseConfig.entry = entry;
  }

  setPack(name = {}, value, useCommonsChunk = false) {
    this.addPack(name, value, useCommonsChunk);
  }

  setWebpackConfig(option) {
    this.webpackConfig = this.merge(this.webpackConfig, option);
  }

  setBuildPath(buildPath) {
    this.buildPath = this.utils.normalizePath(buildPath, this.baseDir);
    this.baseConfig.buildPath = this.buildPath;
    this.setOutputPath(this.buildPath);
  }

  setPublicPath(publicPath, isOverride = true) {
    if (!this.publicPath) {
      this.publicPath = '';
    }
    if (isOverride) {
      this.publicPath = publicPath;
    } else {
      this.publicPath = this.utils.joinPath(this.publicPath, publicPath);
    }
    this.publicPath = `${this.publicPath.replace(/\/$/, '')}/`;
    if (!/^(https?:|\/\/?)/.test(this.publicPath)) {
      this.publicPath = `/${this.publicPath}`;
    }
    this.baseConfig.publicPath = this.publicPath;
    this.setOutputPublicPath(this.publicPath);
  }

  setCDN(cdnUrl, cdnDynamicDir) {
    if (cdnUrl) {
      const publicPath = cdnDynamicDir ? this.utils.joinPath(cdnUrl, cdnDynamicDir) : cdnUrl;
      this.setPublicPath(publicPath);
    }
  }

  setProxy(proxy) {
    this.proxy = proxy;
  }

  setDevMode(port, proxy) {
    this.configInfo.port = port || 9000;
    this.host = this.utils.getHost(this.configInfo.port);
    if (proxy !== undefined) {
      this.setProxy(proxy)
    }
    // 如果不是当前宿主运行, 设置编译的ip:port
    if (!this.configInfo.currentHost) {
      this.setPublicPath(this.utils.joinPath(this.host, this.publicPath.replace(this.host, '')));
    }
    const testFile = path.join(this.baseDir, '.webpack.js');
    /* istanbul ignore if */
    if (fs.existsSync(testFile)) {
      const test = require(testFile);
      if (test.enable) {
        this.configInfo = this.merge(this.configInfo, test.config);
      }
    }
  }

  setDevTool(devtool, force) {
    /* istanbul ignore next */
    if (this.dev || force) {
      this.webpackConfig.devtool = devtool;
    }
  }

  addPack(name = {}, value, useCommonsChunk = false) {
    if (this.utils.isObject(name)) {
      Object.keys(name).forEach(packName => {
        this.addPack(packName, name[packName]);
      });
    } else {
      const files = Array.isArray(value) ? value : [value];
      const normalizeFiles = files.map(file => {
        return this.utils.normalizePath(file, this.baseDir);
      });
      this.addEntry(name, normalizeFiles);
      /* istanbul ignore if */
      if (!useCommonsChunk) {
        this.packs[name] = normalizeFiles;
      }
    }
  }

  addEntry(name, value) {
    const entry = {};
    if (this.utils.isObject(name)) {
      Object.assign(entry, name);
    } else {
      entry[name] = value;
    }
    Object.keys(entry).forEach(key => {
      this.webpackConfig.entry[key] = entry[key];
    });
  }

  static getDllFilePath(name) {
    return utils.getDllFilePath(name);
  }
}

module.exports = Config;