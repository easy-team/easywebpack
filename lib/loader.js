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

exports.css = {
  test: /\.css$/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'postcss-loader']
};

exports.scss = {
  test: /\.scss/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
};

exports.sass = {
  test: /\.sass/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'postcss-loader', {
    loader: 'sass-loader',
    options: {
      indentedSyntax: true
    }
  }]
};

exports.less = {
  test: /\.less/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
};

exports.stylus = {
  test: /\.stylus/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'postcss-loader', 'stylus-loader']
};

exports.urlimage = {
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      }
    }
  ]
};

exports.urlfont = {
  test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024
      }
    }
  ]
};
