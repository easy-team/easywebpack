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
  use: ['style-loader', 'css-loader'],
  postcss: true,
  framework: true
};

exports.scss = {
  test: /\.scss/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
  postcss: true,
  framework: true
};

exports.sass = {
  test: /\.sass/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', {
    loader: 'sass-loader',
    options: {
      indentedSyntax: true
    }
  }],
  postcss: true,
  framework: true
};

exports.less = {
  test: /\.less/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'less-loader'],
  postcss: true,
  framework: true
};

exports.stylus = {
  test: /\.stylus/,
  exclude: /node_modules/,
  use: ['style-loader', 'css-loader', 'stylus-loader'],
  postcss: true,
  framework: true
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
