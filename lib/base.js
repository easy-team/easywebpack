'use strict';
class WebpackBase {
  constructor(config) {
    this.env = process.env.BUILD_ENV;
    this.config = config;
  }
}

WebpackBase.DEV = 'dev';
WebpackBase.TEST = 'test';
WebpackBase.PROD = 'prod';

module.exports = WebpackBase;
