'use strict';

exports.babel = {
  enable: true,
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use() {
    const loaders = [];
    const compile = this.config.compile;
    if (compile.thread) {
      loaders.unshift(this.createThreadLoader(compile.thread));
    }
    loaders.push(this.createBabelLoader());
    return loaders;
  }
};

exports.eslint = {
  enable: false,
  test: /\.jsx?$/,
  use: ['eslint-loader'],
  exclude: /node_modules/,
  enforce: 'pre'
};

exports.typescript = {
  enable: false,
  test: /\.tsx?$/,
  exclude: /node_modules/,
  use() {
    const loaders = [];
    const createTsLoader = options => {
      return { loader: 'ts-loader', options };
    };
    const compile = this.config.compile;
    if (compile.thread) {
      loaders.unshift(this.createThreadLoader(compile.thread));
      loaders.push(createTsLoader({ happyPackMode: true }));
    } else {
      loaders.push(createTsLoader());
    }
    if (compile.cache) {
      loaders.unshift(this.createCacheLoader(compile.cache));
    }
    // react typescript need to dynamic import
    if (this.typescript && this.framework === 'react') {
      loaders.unshift(this.createBabelLoader());
    }
    return loaders;
  }
};

exports.tslint = {
  enable: false,
  test: /\.tsx?$/,
  exclude: /node_modules/,
  enforce: 'pre',
  use: ['tslint-loader'],
};

exports.css = {
  enable: true,
  test: /\.css/,
  use: ['css-loader'],
  postcss: true,
  framework: true
};

exports.scss = {
  enable: false,
  test: /\.scss/,
  use: ['css-loader', 'sass-loader'],
  postcss: true,
  framework: true
};

exports.sass = {
  enable: false,
  test: /\.sass/,
  use: ['css-loader', {
    loader: 'sass-loader',
    options: {
      indentedSyntax: true
    }
  }],
  postcss: true,
  framework: true
};

exports.less = {
  enable: false,
  test: /\.less/,
  use: ['css-loader', 'less-loader'],
  postcss: true,
  framework: true
};

exports.stylus = {
  enable: false,
  test: /\.stylus/,
  use: ['css-loader', 'stylus-loader'],
  postcss: true,
  framework: true
};

exports.urlimage = {
  enable: true,
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      },
      fn(){
        return {
          options: {
            name: this.webpackInfo.imageName
          }
        }
      }
    }
  ]
};

exports.urlmedia = {
  enable: true,
  test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      },
      fn(){
        return {
          options: {
            name: this.webpackInfo.mediaName
          }
        }
      }
    }
  ]
}

exports.urlfont = {
  enable: true,
  test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      },
      fn(){
        return {
          options: {
            name: this.webpackInfo.frontName
          }
        }
      }
    }
  ]
};

exports.nunjucks = {
  enable: false,
  type: 'client',
  test: /\.html$/,
  use: ['html-loader', {
    loader: 'nunjucks-html-loader',
    options: {
      searchPaths: ['src/widget','src/component']
    }
  }]
};

exports.ejs = {
  enable: false,
  type: 'client',
  test: /\.ejs/,
  use: ['ejs-loader']
};