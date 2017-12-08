'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'client';
    if (this.config.egg && this.proxy === undefined) {
      this.setProxy(true);
    }
    this.setDevTool(this.config.devtool);
    this.setOption({ target: 'web' });
  }

  initPack() {
    this.addPack(this.config.packs);
  }

  initHtml() {
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
        if(this.config.dll){
          const manifest = this.getPluginByName('manifestDeps');
          const filepath = manifest && manifest.args && manifest.args.filepath;
          if (fs.existsSync(filepath)) {
            deps = require(filepath).deps;
          }
        }
        Object.keys(entry).forEach(entryName => {
          const entryFile = Array.isArray(entry[entryName]) ? entry[entryName].slice(-1)[0]: entry[entryName];
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
          if(!commonsChunk.includes(entryName)){
            this.plugins[entryName] = this.merge(plugin, { args: { minify, inject, chunks, filename, template, css, js } });
          }
        });
        this.addEntry(entry);
      }
    }
    this.setConfig({ plugins: { html: false } }); // remove html single config
  }

  create() {
    this.initCreate();
    this.initEntry();
    this.initPack();
    this.initHtml();
    this.initHotEntry();
    this.createDllReferencePlugin();
    return super.create();
  }
}
module.exports = WebpackClientBuilder;