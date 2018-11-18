'use strict';
module.exports = {

  createFileName(config) {
    if ((config.hash && this.utils.isTrue(config.fileHash)) || config.fileHash) {
      this.setOutputFileName(this.utils.assetsPath(this.prefix, `js/[name].[chunkhash:${config.hashLength}].js`));
      this.setOutputFileChunkName(this.utils.assetsPath(this.prefix, `js/chunk/[name].[chunkhash:${config.hashLength}].js`));
    } else {
      this.setOutputFileName(this.utils.assetsPath(this.prefix, 'js/[name].js'));
      this.setOutputFileChunkName(this.utils.assetsPath(this.prefix, 'js/chunk/[name].js'));
    }
  },

  createImageName(config) {
    if ((config.hash && this.utils.isTrue(config.imageHash)) || config.imageHash) {
      this.webpackInfo.imageName = this.utils.assetsPath(this.prefix, `img/[name].[hash:${config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.imageName = this.utils.assetsPath(this.prefix, 'img/[name].[ext]');
    }
  },

  createCssName(config) {
    if ((config.hash && this.utils.isTrue(config.cssHash)) || config.cssHash) {
      this.webpackInfo.cssName = this.utils.assetsPath(this.prefix, `css/[name].[contenthash:${config.hashLength}].css`);
      this.webpackInfo.cssChunkName = this.utils.assetsPath(this.prefix, `css/[id].[contenthash:${config.hashLength}].css`);
    } else {
      this.webpackInfo.cssName = this.utils.assetsPath(this.prefix, 'css/[name].css');
      this.webpackInfo.cssChunkName = this.utils.assetsPath(this.prefix, 'css/[id].css');
    }
  },

  createMediaName(config) {
    if ((config.hash && this.utils.isTrue(config.mediaHash)) || config.mediaHash) {
      this.webpackInfo.mediaName = this.utils.assetsPath(this.prefix, `media/[name].[hash:${config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.mediaName = this.utils.assetsPath(this.prefix, 'media/[name].[ext]');
    }
  },

  createFrontName(config) {
    if ((config.hash && this.utils.isTrue(config.fontHash)) || config.fontHash) {
      this.webpackInfo.frontName = this.utils.assetsPath(this.prefix, `font/[name].[hash:${config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.frontName = this.utils.assetsPath(this.prefix, 'font/[name].[ext]');
    }
  },

  createFileOption(config) {
    this.createFileName(config);
    this.createImageName(config);
    this.createCssName(config);
    this.createMediaName(config);
    this.createFrontName(config);
  }

};