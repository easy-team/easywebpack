'use strict';
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const loader = {};

loader.getLoader = (loadersOption, loaderName) => {
  const styleOption = loadersOption[loaderName] || loadersOption[loaderName.replace(/-loader/, '')] || {};
  return loader.getLoaderString(styleOption, require.resolve(loaderName));
};

loader.generateLoaders = (styleConfig, loaders) => {
  const styleLoaderOption = styleConfig.styleLoaderOption || {};
  const styleLoaderName = styleConfig.styleLoaderName || 'style-loader';
  const styleLoaderNameOption = styleLoaderOption[styleLoaderName.replace(/-loader/, '')];
  const styleLoader = merge({
    loader: styleLoaderName
  }, styleLoaderNameOption);

  const sourceLoader = loaders.map(item => {
    const options = styleLoaderOption[item.loader.replace(/-loader/, '')] || {};
    return merge({ loader: styleLoaderName }, options);
  });

  if (styleConfig.extractCss) {
    return ExtractTextPlugin.extract({
      fallback: styleLoader,
      use: sourceLoader
    });
  }

  return [styleLoader].concat(sourceLoader);
};

loader.createPostCssLoader = styleConfig => {
  if (styleConfig.styleLoaderOption.postcss) {
    styleConfig.styleLoaderOption.postcss = [
      require('autoprefixer')({
        browsers: typeof styleConfig.styleLoaderOption.postcss === 'object' ? styleConfig.styleLoaderOption.postcss : ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8']
      })
    ];
  }
  return loader.generateLoaders(styleConfig, [{
    loader: 'postcss-loader'
  }]);
};

loader.createRuleStyleLoader = (styles, styleConfig) => styles.map(style => ({
  test: new RegExp(`\\.${style}$`),
  use: loader.generateLoaders(styleConfig, [{
    loader: `${style}-loader`
  }])
}));

module.exports = loader;
