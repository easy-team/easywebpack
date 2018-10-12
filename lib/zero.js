'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
exports.initDLLDefault = function(config) {
};

exports.initDefault = function(config) {
  if (!config.target && !config.type) {
    config.target = 'web';
  }
  if (!config.entry) {
    config.entry = {
      index: 'src/app.js'
    };
  }
  if (config.framework === 'html' && !config.template) {
    const defaultTemplate = 'src/view/layout.html';
    if (fs.existsSync(path.join(config.baseDir, defaultTemplate))) {
      config.template = defaultTemplate;
    }
  }
};

exports.initEggDefault = function(config) {
  // 如果没有配置，Egg 应用构建路径默认为 public 和 /public/
  if (!config.buildPath) {
    config.buildPath = 'public';
  }
  if (!config.publicPath) {
    config.publicPath = '/public/';
  }
  // 设置默认 entry
  if (!config.entry) {
    if (config.framework === 'vue') {
      config.entry = 'app/web/page/**!(component|components|view|views)/*.vue';
    } else if (config.framework === 'react') {
      config.entry = 'app/web/page/**!(component|components|view|views)/*.jsx';
    }
  }
  // 设置默认 alias
  config.alias = merge({
    asset: 'app/web/asset',
    component: 'app/web/component',
    framework: 'app/web/framework',
    vue: 'vue/dist/vue.esm.js'
  }, config.alias);
};