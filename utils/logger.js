'use strict';
const chalk = require('chalk');

class Logger {
  constructor(option = {}, builder) {
    this.option = option;
    this.builder = builder;
    this.name = this.builder.constructor.name;
  }

  setOption(option) {
    this.option = option;
  }

  info(info, tag = '') {
    console.log(chalk.blue(`[${this.name}] ${tag}:`), typeof info === 'object' ? info : chalk.green(info));
  }

  print(tag, info) {
    if (this.option.enable === undefined || this.option.enable) {
      this.info(info, tag);
    }
  }

  cost(){
    if(this.builder.config.cost){
      this.info(`------ init cost:  ${this.builder.t2- this.builder.t1}, init create cost: ${this.builder.t3- this.builder.t2}, create cost: ${this.builder.t4 - this.builder.t3} -------,  create total cost: ${this.builder.t4- this.builder.t1} -------\r\n`, 'cost');
    }
  }

  debug(webpackConfig) {
    this.env();
    this.config();
    this.keyword();
    this.options();
    this.all(webpackConfig);
  }

  line(tag, info) {
    this.lineStart(tag);
    this.print(tag, info);
    this.lineEnd(tag);
  }

  lineStart(tag) {
    this.print(tag, '-------------------start-------------------------');
  }

  lineEnd(tag) {
    this.print(tag, '-------------------end-------------------------');
  }

  env() {
    if (this.option.env) {
      this.info(`------ NODE_ENV: ${process.env.NODE_ENV}, BUILD_ENV: ${process.env.BUILD_ENV},  UPLOAD_CDN: ${process.env.UPLOAD_CDN} -------`, 'env');
    }
  }

  all(info) {
    if (this.option.all) {
      this.lineStart('all');
      if (info) {
        this.print('all', info);
      } else {
        this.config();
        this.keyword();
        this.loader();
        this.plugin();
      }
      this.lineEnd('all');
    }
  }

  config() {
    if (this.option.config) {
      this.print('config', this.builder.config);
    }
  }

  keyword() {
    if (this.option.keyword) {
      this.print('env', this.builder.env);
      this.print('extractCss', this.builder.extractCss);
      this.print('buildPath', this.builder.buildPath);
      this.print('publicPath', this.builder.publicPath);
      this.print('filename', this.builder.filename);
      this.print('imageName', this.builder.imageName);
      this.print('cssName', this.builder.cssName);
    }
  }

  options(options) {
    if (this.option.options) {
      this.print('options', options || this.builder.options);
    }
  }

  loader(loaders) {
    if (this.option.loader) {
      this.line('loaders', loaders);
    }
  }

  plugin(plugins) {
    if (this.option.plugin) {
      this.line('plugins', plugins);
    }
  }
}

module.exports = Logger;
