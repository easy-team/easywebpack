'use strict';
const WebpackBaseLoader = require('../base/loader');
module.exports = class WebpackLoader extends WebpackBaseLoader {
  babel() {
    const loader = this.merge({
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: []
    });
    const compile = this.config.compile;
    if (compile.thread) {
      const threadInfo = compile.thread === true ? {} : compile.thread;
      loader.use.push(super.createThreadLoader(threadInfo));
    }
    loader.use.push(super.createBabelLoader());
    return loader;
  }

  eslint() {
    return {
      test: /\.jsx?$/,
      use: ['eslint-loader'],
      exclude: /node_modules/,
      enforce: 'pre'
    };
  }

  ts() {
    const use = [];
    const compile = this.config.compile || {};
    const {
      thread,
      cache
    } = compile;
    if (thread) {
      const threadInfo = thread === true ? {} : thread;
      use.unshift(this.createThreadLoader(threadInfo));
      use.push(this.createTsLoader());
    } else {
      use.push(this.createTsLoader());
    }
    if (cache) {
      const cacheInfo = thread === true ? {} : cache;
      use.unshift(this.createCacheLoader(cacheInfo));
    }
    return {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use
    };
  }

  tslint() {
    return {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      enforce: 'pre',
      use: ['tslint-loader']
    };
  }

  css() {
    return {
      test: /\.css/,
      use: ['css-loader']
    };
  }

  scss() {
    return {
      test: /\.scss/,
      use: ['css-loader', 'sass-loader']
    };
  }

  less() {
    return {
      test: /\.less/,
      use: ['css-loader', 'less-loader']
    };
  }

  stylus() {
    return {
      test: /\.stylus/,
      use: ['css-loader', 'stylus-loader']
    };
  }

  image() {
    return {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: this.webpackInfo.imageName
        }
      }]
    };
  }

  media() {
    return {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: this.webpackInfo.mediaName
        }
      }]
    };
  }

  font() {
    return {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: this.webpackInfo.frontName
        }
      }]
    };
  }

  nunjucks() {
    return {
      test: /\.html$/,
      use: [
        { loader: 'html-loader' },
        {
          loader: 'nunjucks-html-loader',
          options: {
            searchPaths: ['src/widget', 'src/component']
          }
        }
      ]
    };
  }

  ejs() {
    return {
      test: /\.ejs/,
      use: ['ejs-loader']
    };
  }
};