'use strict';

exports.babel = {
  enable: true,
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader'
    }
  ]
};

exports.eslint = {
  enable: true,
  test: /\.jsx?$/,
  use: ['eslint-loader'],
  exclude: [/node_modules/],
  enforce: 'pre'
};

exports.css = {
  enable: true,
  test: /\.css$/,
  exclude: /node_modules/,
  use: ['css-loader'],
  postcss: true,
  framework: true
};

exports.scss = {
  enable: true,
  test: /\.scss/,
  exclude: /node_modules/,
  use: ['css-loader', 'sass-loader'],
  postcss: true,
  framework: true
};

exports.sass = {
  enable: true,
  test: /\.sass/,
  exclude: /node_modules/,
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
  enable: true,
  test: /\.less/,
  exclude: /node_modules/,
  use: ['css-loader', 'less-loader'],
  postcss: true,
  framework: true
};

exports.stylus = {
  enable: true,
  test: /\.stylus/,
  exclude: /node_modules/,
  use: ['css-loader', 'stylus-loader'],
  postcss: true,
  framework: true
};

exports.urlimage = {
  enable: true,
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      },
      fn(){
        return {
          options: {
            name: this.config.imageName
          }
        }
      }
    }
  ]
};

exports.urlfont = {
  enable: true,
  test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      },
      fn(){
        return {
          options: {
            name: this.config.frontName
          }
        }
      }
    }
  ]
};
