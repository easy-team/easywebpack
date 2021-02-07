'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const AssetFileWebpackPlugin = require('webpack-asset-file-plugin');
const Config = require('../core/config');
const { STYLE_LOADER } = require('../core/constant');
class WebpackBaseBuilder extends Config {
  constructor(config = {}) {
    super(config);
    this.setStyleLoader(STYLE_LOADER);
    this.setDevTool(config.devtool);
  }

  getDLLChunk() {
    const dir = this.utils.getDllCompileFileDir(this.env);
    const dll = this.utils.getDllConfig(this.config.dll);
    const chunks = [];
    const names = [];
    dll.forEach(item => {
      const name = item.name;
      const manifestFile = this.utils.getDllManifestPath(item.name, this.env);
      if (fs.existsSync(manifestFile)) {
        const manifest = require(manifestFile);
        Object.keys(manifest).forEach(id => {
          const outputPath = manifest[id];
          const outputName = outputPath.replace(this.publicPath, '');
          const filepath = path.join(dir, outputName);
          const chunk = {
            id, // vendor.js
            name, // vendor
            outputName, // js/vendor.js
            outputPath, // public/js/vendor.js
            filepath // ${baseDir}/js/vendor.js
          };
          chunks.push(chunk);
        });
      }
      names.push(name);
    });
    return { names, chunks, dll };
  }

  getCommonsChunk(useRuntime = true) {
    return this.webpackOptimize.getCommonsChunk();
  }

  prepareEntry(entries, entryLoader = {}) {
    if (this.entryLoader) {
      const mergeLoader = this.merge(entryLoader, this.entryLoader);
      const entryLoaderOptions = mergeLoader.options || mergeLoader;
      const { match, loader } = entryLoaderOptions;
      let templateFile = entryLoaderOptions.templateFile || '';
      // 零配置：设置默认 entry 模板代码路径配置， TODO entry exclude 实现
      if (templateFile) {
        templateFile = path.relative(this.baseDir, templateFile);
      } else {
        const defaultEntryTemplateFile = this.egg ? './app/web/framework/entry/template.js' : './src/framework/entry/template.js';
        const defaultEggEntryTemplateFilePath = this.utils.normalizePath(defaultEntryTemplateFile, this.baseDir);
        if (fs.existsSync(defaultEggEntryTemplateFilePath)) {
          templateFile = defaultEntryTemplateFile;
        }
      }

      if (match && loader) {
        const babel = this.createBabelLoader();
        const babelLoaderString = `${babel.loader}?${JSON.stringify(babel.options)}`;
        const entryLoaderString = this.utils.getLoaderOptionString(loader, { templateFile, renderMode: this.renderMode });
        const regMatch = match instanceof RegExp ? match : new RegExp(match);
        Object.keys(entries).forEach(entryName => {
          const entryFile = entries[entryName];
          if (this.utils.isString(entryFile)) {
            const fileExt = path.extname(entryFile);
            if (regMatch.test(fileExt)) {
              entries[entryName] = [babelLoaderString, entryLoaderString, entryFile].join('!');
            }
          }
        });
      }
    }
    return entries;
  }

  createEntry(config) {
    const entry = this.utils.getEntry(config, this.type);
    this.prepareEntry(entry);
    this.setWebpackConfig({ entry });
  }

  createOutput(config) {
    return {
      path: this.buildPath,
      publicPath: this.publicPath
    };
  }

  initCreate(config) {
    if (config.create) {
      config.create.bind(this)();
    }
    if (this.type) {
      const onName = `on${this.type.replace(/^\S/, m => m.toUpperCase())}`;
      if (config[onName] && this.utils.isFunction(config[onName])) {
        config[onName].apply(this);
      }
    }
  }

  setStartCreateQueue(fn, args) {
    this.startCreateQueue.push({ fn, args });
  }

  setBeforeCreateQueue(fn, args) {
    this.beforeCreateQueue.push({ fn, args });
  }

  setCreateQueue(fn, args) {
    this.setBeforeCreateQueue(fn, args);
  }

  executeCreateQueue(queue) {
    queue.forEach(q => {
      if (q.args) {
        const args = this.utils.isFunction(q.args) ? q.args.apply(this) : q.args;
        q.fn.apply(this, [args]);
      } else {
        q.fn.apply(this);
      }
    });
  }

  createOptimization() {
    return this.webpackOptimize.getOptimization();
  }

  combineWebpackConfig(config) {
    this.t3 = Date.now();
    const buildWebpackConfig = {
      output: this.createOutput(config),
      module: {
        rules: this.createWebpackLoader(config)
      },
      plugins: this.createWebpackPlugin(config),
      optimization: this.createOptimization(config)
    };
    const webpackConfig = this.mergeWebpackConfig(this.nativeWebpackConfig, buildWebpackConfig);
    this.t4 = Date.now();
    this.logger.cost();
    // support webpack config customize hook
    if (this.utils.isFunction(config.customize)) {
      return config.customize.call(this, webpackConfig) || webpackConfig;
    }
    return webpackConfig;
  }

  create() {
    this.t2 = Date.now();
    this.setAlias(this.config.alias);
    this.initCreate(this.config);
    this.executeCreateQueue(this.startCreateQueue);
    this.createEntry(this.config);
    this.createFileOption(this.config);
    this.executeCreateQueue(this.beforeCreateQueue);
    return this.combineWebpackConfig(this.config);
  }

  createWebpackConfig() {
    return this.create();
  }

  checkCreate(config) {
    assert(config.buildPath, 'webpack output path not set, please call setBuildPath method set');
    assert(config.publicPath, 'webpack output publicPath not set, please call setPublicPath method set');
    /* istanbul ignore next */
    assert(config.entry || this.webpackConfig.entry, 'webpack entry is empty, please call setEntry or setHtml');
  }

  createDllPlugin(dll) {
    dll = dll || this.config.dll;
    const dllArray = WebpackBaseBuilder.getDllConfig(dll);
    dllArray.forEach(item => {
      if (item.name && item.lib) {
        const plugin = {};
        plugin[`${item.name}Dll`] = new this.webpack.DllPlugin({
          context: this.baseDir,
          path: WebpackBaseBuilder.getDllFilePath(item.name, this.env),
          name: '[name]'
        });
        this.addPlugin(plugin);
      }
    });
  }

  createDllReferencePlugin(dll) {
    dll = dll || this.config.dll;
    const dllArray = WebpackBaseBuilder.getDllConfig(dll);
    dllArray.forEach(item => {
      if (item.name && item.lib) {
        const plugin = {};
        const filename = WebpackBaseBuilder.getDllFilePath(item.name, this.env);
        if (fs.existsSync(filename)) {
          plugin[`${item.name}DllReference`] = new this.webpack.DllReferencePlugin({
            context: this.baseDir,
            manifest: require(filename)
          });
          this.addPlugin(plugin);
        }
      }
    });
  }

  createDllAssetPlugin() {
    const dllChunk = this.getDLLChunk();
    if (dllChunk.chunks.length) {
      this.addPlugin({
        dllAsset: new AssetFileWebpackPlugin({
          assets: dllChunk.chunks
        })
      });
    }
  }
}
module.exports = WebpackBaseBuilder;