'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = WebpackClientBuilder.TYPE;
    this.setProxy(config.egg);
    this.setDevTool(config.devtool);
    this.setPack(config.packs);
    this.setTarget(WebpackClientBuilder.TARGET);
    this.setCommonsChunkLib();
    this.setCreateQueue(this.createDllReferencePlugin);
    this.setCreateQueue(this.createHTML);
    this.setCreateQueue(this.createHotEntry);
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

  createHotEntry() {
    if (this.config.hot) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const defaultHotConfig = { noInfo: false, reload: false, quiet: false };
      const hot = this.utils.isObject(this.config.hot) ? this.merge(defaultHotConfig, this.config.hot) : defaultHotConfig;
      const hotInfo = [`${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${this.utils.getIp()}:${this.config.port}/__webpack_hmr`];
      Object.keys(hot).forEach(key => {
        hotInfo.push(`${key}=${hot[key]}`);
      });
      const hotConfig = [hotInfo.join('&')];

      // open extract css hot reload
      if (this.config.hotCss) {
        hotConfig.push(require.resolve('../utils/hot'));
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
    if (this.config.entry && (this.config.entry.template || this.config.entry.html || this.config.framework === 'html')) {
      const pluginName = 'html';
      const plugin = this.getPluginByName(pluginName);
      if (this.isUse(plugin)) {
        let globalTemplate = this.config.entry.template;
        const config = this.utils.cloneDeep(this.config);
        if (this.utils.isObject(config.entry.html)) {
          globalTemplate = config.entry.html.template || globalTemplate;
          if (config.entry.html.include) {
            config.entry = Object.assign(config.entry, { include: null, exclude: null }, config.entry.html);
          }
        }
        globalTemplate = this.utils.normalizePath(globalTemplate, config.baseDir);
        const entry = this.utils.getEntry(config, this.type);
        const extMath = this.config.entry.extMatch || '.js';

        let deps;
        if (this.config.dll) {
          const manifest = this.getPluginByName('manifestDeps');
          const filepath = manifest && manifest.args && manifest.args.filepath;
          if (fs.existsSync(filepath)) {
            deps = require(filepath).deps;
          }
        }
        Object.keys(entry).forEach(entryName => {
          const entryFile = Array.isArray(entry[entryName]) ? entry[entryName].slice(-1)[0] : entry[entryName];
          const entryTemplate = entryFile.replace(extMath, config.templateExt || '.html');
          const template = fs.existsSync(entryTemplate) ? entryTemplate : globalTemplate;
          const htmlDir = config.entry.buildDir || config.prefix;
          const filename = htmlDir ? `${htmlDir}/${entryName}.html` : `${entryName}.html`;
          const resource = deps && deps[`${entryName}.js`] || {};
          const js = resource.js || [];
          const css = resource.css || [];
          const inject = js.length ? false : true;
          const minify = this.prod;
          const commonsChunk = inject ? this.getCommonsChunk() : [];
          const chunks = inject ? [].concat(commonsChunk).concat(entryName) : [entryName];
          if (!commonsChunk.includes(entryName)) {
            this.plugins[entryName] = this.merge(plugin, {
              args: {
                minify,
                inject,
                chunks,
                filename,
                template,
                css,
                js
              }
            });
          }
        });
        this.addEntry(entry);
      }
    }
    this.mergePlugin({ html: false }); // remove html single config
  }
}
WebpackClientBuilder.TYPE = 'client';
WebpackClientBuilder.TARGET = 'web';
module.exports = WebpackClientBuilder;