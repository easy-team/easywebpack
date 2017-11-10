'use strict';
const path = require('path');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'client';
    if (this.config.egg && this.config.proxy === undefined) {
      this.setProxy(true);
    }
  }

  initHotEntry() {
    if (this.config.hot) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const defaultHotConfig = { noInfo: false, reload: true, quiet: false };
      const hot = this.utils.isObject(this.config.hot) ? this.merge(defaultHotConfig, this.config.hot) : defaultHotConfig;
      const hotInfo = [`${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${this.utils.getIp()}:${this.config.port}/__webpack_hmr`];
      Object.keys(hot).forEach(key =>{
        hotInfo.push(`${key}=${hot[key]}`);
      });
      const hotConfig = hotInfo.join('&');
      const packKeys = Object.keys(this.packs);
      const commonsChunk = this.getCommonsChunk();
      Object.keys(this.options.entry).forEach(name => {
        if (!packKeys.includes(name) && !commonsChunk.includes(name)) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }

  initPack() {
    this.addPack(this.config.packs);
  }

  initHtml() {
    if (this.config.entry && (this.config.entry.template || this.config.entry.html)) {
      const pluginName = 'html';
      const plugin = this.getPluginByName(pluginName);
      if (this.isUse(plugin)) {
        let template = this.config.entry.template;
        const config = this.utils.cloneDeep(this.config);
        if (this.utils.isObject(config.entry.html)) {
          template = config.entry.html.template || template;
          if (config.entry.html.include) {
            config.entry = Object.assign(config.entry, { include: null, exclude: null }, config.entry.html);
          }
        }
        template = this.utils.normalizePath(template, config.baseDir);
        const entry = this.utils.getEntry(config, this.type);
        const commonsChunk = this.getCommonsChunk();
        Object.keys(entry).forEach(entryName => {
          const chunks = [].concat(commonsChunk).concat(entryName);
          const htmlDir = config.entry.buildDir || config.prefix;
          const filename = htmlDir ? `${htmlDir}/${entryName}.html` : `${entryName}.html`;
          this.plugins[entryName] = this.merge(plugin, { args: { chunks, filename, template } });
        });
        this.addEntry(entry);
      }
    }
    this.mergeConfig({ plugins: { html: false } }); // remove html single config
  }

  create() {
    this.initCreate();
    this.initEntry();
    this.initPack();
    this.initHtml();
    this.initHotEntry();
    return super.create();
  }
}
module.exports = WebpackClientBuilder;