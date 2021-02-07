'use strict';
const os = require('os');
const fs = require('fs');
const open = require('opn');
const path = require('path');
const detect = require('detect-port');
const utils = {};

utils.getIp = position => {
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

utils.getBrowserUrl = (port, url) => {
  let browserUrl;
  if (/^(https?:|\/\/)/.test(url)) {
    browserUrl = url;
  } else {
    const host = utils.getHost(port);
    if (url) {
      browserUrl = `${host}/${url}`;
    } else {
      browserUrl = host;
    }
  }
  return browserUrl;
};

utils.openBrowser = (port, url) => {
  const browserUrl = utils.getBrowserUrl(port, url);
  open(browserUrl);
  return browserUrl;
};

utils.open = url => {
  open(url);
};

utils.normalizeURL = (port, publicPath, filename) => {
  if (/^(https?:|\/\/)/.test(publicPath)) {
    return publicPath + filename;
  }
  const host = utils.getHost(port);
  return `${host + publicPath + filename}`;
};

utils.normalizeHotEntry = (webpackConfig, port) => {
  const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
  hotMiddleware.pop();
  const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${utils.getIp()}:${port}/__webpack_hmr&noInfo=false&reload=true&quiet=false`;
  Object.keys(webpackConfig.entry).forEach(name => {
    const value = webpackConfig.entry[name];
    const tempValues = Array.isArray(value) ? value : [value];
    const isHot = tempValues.some(v => {
      return /webpack-hot-middleware/.test(v);
    });
    if (!isHot) {
      webpackConfig.entry[name] = [hotConfig].concat(value);
    }
  });
  return webpackConfig;
};

utils.getPort = (port) => {
  return detect(port).then(_port => {
    return _port;
  }).catch(err => {
    return port;
  });
};

utils.getCLI = (cli) => {
  if (cli && cli.name && cli.cmd) {
    return cli;
  }
  return global.EASY_CLI || { name: 'easywebpack-cli', cmd: 'easy' };
};

// webpack-tool 的 package.json 中 webpack 版本设定为 4.28.4, 可以项目安装指定版本覆盖内置版本
utils.getWebpack = () => {
  const webpackPath = path.resolve(process.cwd(), 'node_modules', 'webpack');
  if (fs.existsSync(webpackPath)) {
    return require(webpackPath);
  }
  return require('webpack');
};

module.exports = utils;