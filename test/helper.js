'use strict';

const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
const WebpackBaseBuilder = require('../lib/target/base');
const WebpackClientBuilder = require('../lib/target/client');
const path = require('path').posix;
// http://chaijs.com/api/bdd/

exports.createBuilder = config => {
  const builder = new WebpackBaseBuilder(config);
  builder.setBuildPath(path.join(__dirname, '../dist/loader'));
  builder.setPublicPath('/public');
  builder.setEntry({
    include: path.join(__dirname, '../test')
  });
  return builder;
};

exports.createClientBuilder = config => {
  const builder = new WebpackClientBuilder(merge({
    entry: {
      include: path.join(__dirname)
    }
  }, config));
  if (config && config.type) {
    builder.type = config.type;
  }
  builder.setBuildPath(path.join(__dirname, 'dist/client'));
  builder.setPublicPath('/public');
  return builder;
};


exports.getLoaderByName = (name, rules, test) => {
  const loaderName = `${name}-loader`;
  return rules.find(rule => {
    return rule.use.some(loader => {
      const hasLoader = loaderName === loader || (typeof loader === 'object' && loader.loader === loaderName);
      if (test && rule.test && typeof loader === 'object') {
        return rule.test.toString().indexOf(test) > -1 && hasLoader;
      }
      return hasLoader;
    });
  });
};

exports.getPluginByLabel = (label, plugins) => {
  return plugins.find(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
};