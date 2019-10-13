'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');
const babelrc = require('../../config/babel.web');
class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = WebpackClientBuilder.TYPE;
    this.setBabelrc(babelrc);
    this.setPack(config.packs);
    this.setTarget(WebpackClientBuilder.TARGET);
    // this.setCommonsChunkLib();
    this.setStartCreateQueue(this.setBabelENV);
    this.setCreateQueue(this.createDllAssetPlugin);
    this.setCreateQueue(this.createDllReferencePlugin);
    this.setCreateQueue(this.createHTML);
    this.setCreateQueue(this.createHotEntry);
  }

  prepareLoaderOption(loaders, loaderOptions) {
    super.prepareLoaderOption(loaders, loaderOptions);
    // 自动设置sourceMap
    const options = this.webpackConfig.devtool ? { sourceMap: true } : {};
    const cssLoaderOptions = this.getCssLoaderOptions();
    Object.keys(loaders).forEach(name => {
      const itemLoader = loaders[name];
      if (Array.isArray(itemLoader.use)) {
        itemLoader.use.forEach((loader, index) => {
          if (this.utils.isObject(loader) && this.utils.isString(loader.loader)) {
            if (this.sourceMapLoaders.indexOf(loader.loader) > -1) {
              if (loader.loader === 'css-loader') {
                itemLoader.use[index] = this.merge({ options }, { options: cssLoaderOptions }, itemLoader.use[index]);
              } else {
                itemLoader.use[index] = this.merge({ options }, itemLoader.use[index]);
              }
            }
          }
        });
      }
    });
  }

  setCommonsChunkLib(entry, name = 'common') {
    const lib = this.config.lib;
    if (entry) {
      this.addEntry(name, entry);
    } else if (lib) {
      if (this.utils.isObject(lib) && lib.name && lib.lib) {
        this.addEntry(lib.name, lib.lib);
      } else {
        this.addEntry(name, lib);
      }
    }
  }

  createOptimization() {
    return this.webpackOptimize.getWebOptimization();
  }

  createHotEntry() {
    if (this.hot) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const defaultHotConfig = { noInfo: false, reload: false, quiet: false };
      const hot = this.utils.isObject(this.config.hotConfig) ? this.merge(defaultHotConfig, this.config.hotConfig) : defaultHotConfig;
      // 当proxy为字符串时，表示自定义代理域名，只在dev环境使用
      const hotInfo = [`${path.posix.join(hotMiddleware.join(path.sep))}/client?path=${this.host}/__webpack_hmr`];
      Object.keys(hot).forEach(key => {
        hotInfo.push(`${key}=${hot[key]}`);
      });
      const hotConfig = [hotInfo.join('&')];

      // open extract css hot reload
      if (this.dev && this.config.hotCss !== false && this.isUse('extract')) {
        hotConfig.push(require.resolve('../../utils/hot'));
      }
      const packKeys = Object.keys(this.packs);
      const commonsChunk = this.getCommonsChunk();
      Object.keys(this.webpackConfig.entry).forEach(name => {
        if (!packKeys.includes(name) && !commonsChunk.includes(name)) {
          this.webpackConfig.entry[name] = hotConfig.concat(this.webpackConfig.entry[name]);
        }
      });
    }
  }

  createHTML() {
    if ((this.config.entry || (this.webpackConfig.entry && Object.keys(this.webpackConfig.entry).length)) &&
    (this.config.template || this.config.entry.template || this.config.entry.html || this.config.framework === 'html')) {
      const pluginName = 'html';
      const plugin = this.getPluginByName(pluginName);
      if (this.isUse(plugin)) {
        let globalTemplate = this.config.template || this.config.entry.template;
        const config = this.utils.cloneDeep(this.config);
        /* istanbul ignore next */
        if (this.utils.isObject(config.entry.html)) {
          globalTemplate = config.entry.html.template || globalTemplate;
          /* istanbul ignore next */
          if (config.entry.html.include) {
            config.entry = Object.assign(config.entry, { include: null, exclude: null }, config.entry.html);
          }
        }
        // 如果存在同名 html 模板文件, 全局 template 配置非必须
        globalTemplate = globalTemplate && this.utils.normalizePath(globalTemplate, config.baseDir);

        let deps;
        if (this.config.dll) {
          const manifest = this.getPluginByName('manifest');
          const filepath = manifest && manifest.args && manifest.args.filepath;
          if (fs.existsSync(filepath)) {
            deps = require(filepath).deps;
          }
        }
        const entry = this.webpackConfig.entry;

        Object.keys(entry).forEach(entryName => {
          const entryFile = (Array.isArray(entry[entryName]) ? entry[entryName].slice(-1)[0] : entry[entryName])
            .replace(/^.*!/, ''); // 提取'xx-loader!index.vue'后面的路径
          const templateExt = globalTemplate && fs.existsSync(globalTemplate) ? path.extname(globalTemplate) : '.html';
          const entryTemplate = entryFile.replace(path.extname(entryFile), templateExt);
          const template = fs.existsSync(entryTemplate) ? entryTemplate : globalTemplate;
          const htmlDir = config.buildDir;
          const filename = htmlDir ? `${htmlDir}/${entryName}.html` : `${entryName}.html`;
          const resource = deps && deps[`${entryName}.js`] || {};
          const js = resource.js || [];
          const css = resource.css || [];
          const minify = this.prod ? {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            html5: true,
            minifyCSS: true,
            removeComments: true,
            removeEmptyAttributes: true
          } : false;
          const commonsChunk = this.getCommonsChunk();
          const dllChunks = this.getDLLChunk();
          const chunks = [].concat(dllChunks.names).concat(commonsChunk);
          if (!commonsChunk.includes(entryName)) {
            chunks.push(entryName);
            this.plugins[entryName] = this.merge({ args: { minify, chunks, filename, template, css, js } }, plugin);
          }
        });
      }
    }
    this.removePlugin('html'); // remove html single config
  }
}
WebpackClientBuilder.TYPE = 'client';
WebpackClientBuilder.TARGET = 'web';
module.exports = WebpackClientBuilder;
