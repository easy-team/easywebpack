'use strict';
const path = require('path');
const chalk = require('chalk');
const { webpack } = require('webpack-tool');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin');
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-resource-plugin');
const ProgressPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = class WebpackPlugin {
  constructor(ctx) {
    this.ctx = ctx;
    this.plugins = ['clean', 'progress', 'case', 'provide', 'define', 'manifest', 'extract', 'cssmini'];
  }

  clean() {
    const dist = path.relative(this.ctx.baseDir, this.output.path);
    const dirs = [dist];
    const options = { root: this.ctx.baseDir };
    return new CleanWebpackPlugin(dirs, options);
  }

  progress() {
    const options = {
      width: 100,
      format: `webpack build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
      clear: false
    };
    return new ProgressPlugin(options);
  }

  hot() {
    return new webpack.HotModuleReplacementPlugin();
  }

  case() {
    return new CaseSensitivePlugin();
  }

  provide() {
    return new webpack.ProvidePlugin();
  }

  define() {
    return new webpack.DefinePlugin();
  }

  manifest() {
    return new ManifestPlugin();
  }

  extract() {
    const options = {
      filename: this.webpackInfo.cssName,
      chunkFilename: this.webpackInfo.cssChunkName
    };
    return new MiniCssExtractPlugin(options);
  }

  cssmini() {
    return new OptimizeCssAssetPlugin();
  }

  ignore() {
    return new webpack.IgnorePlugin(/\.(css|less|scss|sass)$/);
  }

  replace() {
    return new webpack.NormalModuleReplacementPlugin(/\.(css|less|scss|sass)$/, require.resolve('node-noop'));
  }

  html() {
    return new HtmlWebpackPlugin();
  }

  analyzer() {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    const prefix = this.dll ? 'dll' : this.type;
    const options = {
      analyzerPort: this.dll ? 9997 : this.ssr ? 9998 : 9999,
      statsFilename: prefix ? `${prefix}_analyzer_stats.json` : 'analyzer_stats.json'
    };
    return new BundleAnalyzerPlugin(options);
  }

  stats() {
    const StatsPlugin = require('stats-webpack-plugin');
    const prefix = this.dll ? 'dll' : this.type;
    const name = prefix ? `${prefix}_stats.json` : 'stats.json';
    return new StatsPlugin(name, {
      chunkModules: true,
      exclude: [/node_modules[\\/]/]
    });
  }
};