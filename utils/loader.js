'use strict';
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const loader = {};

/**
 * {[ '/app/web/asset/style','/app/web/framework' ],c: '1',d: 'test',a: true,b: false }
 * => includePaths[]=/app/web/asset/style,includePaths[]=/app/web/framework,c=1,d=test,+a,-b
 * @param {Object}  styleLoaderOption  json config
 * @param {string}  name  loader name or loader entry filepath
 * @returns {string} format loader option str
 */
loader.getLoaderString = (styleLoaderOption, name) => {
  const kvArray = [];
  const options = styleLoaderOption && styleLoaderOption.options;
  options && Object.keys(options).forEach(key => {
    const value = options[key];
    if (Array.isArray(value)) {
      value.forEach(item => {
        kvArray.push(`${key}[]=${item}`);
      });
    } else if (value === 'required') {
      kvArray.push(`${key}`);
    } else {
      kvArray.push(`${key}=${value}`);
    }
  });
  const optionStr = kvArray.join(',');

  if (name) {
    return /\?/.test(name) ? `${name},${optionStr}` : name + (optionStr ? `?${optionStr}` : '');
  }
  return optionStr;
};

loader.getStyleLoaderOption = styleConfig => {
  return {
    loaders: loader.cssLoaders(styleConfig),
    preLoaders: {
      less: 'less-loader',
      scss: 'sass-loader',
      sass: 'sass-loader?indentedSyntax',
      stylus: 'stylus-loader'
    }
  };
};

loader.getLoader = (loadersOption, loaderName) => {
  const styleOption = loadersOption[loaderName] || loadersOption[loaderName.replace(/-loader/, '')] || {};

  return loader.getLoaderString(styleOption, require.resolve(loaderName));
};

loader.generateLoaders = (styleConfig, loaders) => {
  const styleLoaderOption = styleConfig.styleLoaderOption || {};
  const styleLoaderName = styleConfig.styleLoaderName || 'style-loader';
  const styleLoaderNameOption = styleLoaderOption[styleLoaderName] || styleLoaderOption[styleLoaderName.replace(/-loader/, '')];
  const styleLoader = loader.getLoaderString(styleLoaderNameOption, require.resolve(styleLoaderName));

  const sourceLoader = loaders.map(item => {
    const itemStyleLoaderOption = styleLoaderOption[item] || styleLoaderOption[item.replace(/-loader/, '')] || {};
    return loader.getLoaderString(itemStyleLoaderOption, require.resolve(item));
  }).join('!');
  if (styleConfig.extractCss) {
    return ExtractTextPlugin.extract({
      fallback: styleLoader,
      use: sourceLoader
    });
  }

  return [styleLoader, sourceLoader].join('!');
};

loader.getLoaderConfig = (loaderName, styleConfig) => {
  const loadersOption = styleConfig.styleLoaderOption || {};
  const styleOption = loadersOption[loaderName] || loadersOption[loaderName.replace(/-loader/, '')] || {};
  return merge({ loader: loaderName }, styleOption);
};

loader.getCssLoader = styleConfig => loader.getLoaderConfig('css-loader', styleConfig);

loader.getLessLoader = styleConfig => loader.getLoaderConfig('less-loader', styleConfig);

loader.getSassLoader = styleConfig => loader.getLoaderConfig('sass-loader', styleConfig);

loader.isTrue = value => value !== false;

loader.cssLoaders = styleConfig => {
  const loaderOption = merge({
    css: {
      deps: {
        postcss: true
      }
    },
    less: {
      deps: {
        css: true,
        postcss: true
      }
    },
    scss: {
      deps: {
        css: true,
        postcss: true
      }
    },
    sass: {
      deps: {
        css: true,
        postcss: true
      }
    },
    stylus: {
      deps: {
        css: true,
        postcss: true
      }
    }
  }, styleConfig.styleLoaderOption);

  const cssLoaders = {};

  if (loaderOption.css) {
    const extendCssLoader = ['css-loader'];
    if (loaderOption.css.deps.postcss) {
      extendCssLoader.push('postcss-loader');
    }
    cssLoaders.css = loader.generateLoaders(styleConfig, extendCssLoader);
  }

  if (loaderOption.less) {
    const extendLessLoader = [];
    if (loaderOption.less.deps.css) {
      extendLessLoader.push('css-loader');
    }
    if (loaderOption.less.deps.postcss) {
      extendLessLoader.push('postcss-loader');
    }
    extendLessLoader.push('less-loader');
    cssLoaders.less = loader.generateLoaders(styleConfig, extendLessLoader);
  }

  if (loaderOption.scss) {
    const extendScssLoader = [];
    if (loaderOption.scss.deps.css) {
      extendScssLoader.push('css-loader');
    }
    if (loaderOption.scss.deps.postcss) {
      extendScssLoader.push('postcss-loader');
    }
    extendScssLoader.push('sass-loader');
    const scssStyleConfig = merge({}, styleConfig);
    delete scssStyleConfig.styleLoaderOption.sass.options.indentedSyntax;
    cssLoaders.scss = loader.generateLoaders(scssStyleConfig, extendScssLoader);
  }

  if (loaderOption.sass) {
    const extendSassLoader = [];
    if (loaderOption.sass.deps.css) {
      extendSassLoader.push('css-loader');
    }
    if (loaderOption.sass.deps.postcss) {
      extendSassLoader.push('postcss-loader');
    }
    extendSassLoader.push('sass-loader');
    cssLoaders.sass = loader.generateLoaders(styleConfig, extendSassLoader);
  }

  if (loaderOption.stylus) {
    const extendSassLoader = [];
    if (loaderOption.stylus.deps.css) {
      extendSassLoader.push('css-loader');
    }
    if (loaderOption.stylus.deps.postcss) {
      extendSassLoader.push('postcss-loader');
    }
    extendSassLoader.push('stylus-loader');
    cssLoaders.stylus = loader.generateLoaders(styleConfig, extendSassLoader);
  }

  return cssLoaders;
};

loader.styleLoaders = styleConfig => {
  const output = [];
  const styleLoaderOption = styleConfig.styleLoaderOption || {};
  const loaders = loader.cssLoaders(styleConfig);
  for (const extension in loaders) {
    const loaderInfo = loaders[extension];
    const config = styleLoaderOption[extension] && styleLoaderOption[extension].config;
    output.push(merge({
      test: new RegExp(`\\.${extension}$`),
      loader: loaderInfo
    }, config));
  }
  return output;
};

module.exports = loader;