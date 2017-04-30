'use strict';

class ConfigBase {
  constructor(config) {
    this.env = process.env.BUILD_ENV;
    this.client = process.env.BUILD_CLIENT;
    this.server = process.env.BUILD_SERVER;
    this.config = config;
  }
}
module.exports = ConfigBase;
