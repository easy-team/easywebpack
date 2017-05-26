"use strict";

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const loader = {};

/**
 * {[ '/app/web/asset/style','/app/web/framework' ],c: '1',d: 'test',a: true,b: false }
 * => includePaths[]=/app/web/asset/style,includePaths[]=/app/web/framework,c=1,d=test,+a,-b
 * @param {Object}  options  json config
 * @param {string}  name  loader name or loader entry filepath
 * @returns {string} format loader option str
 */
loader.getLoaderString = (options, name) => {
  const kvArray = [];

  options && Object.keys(options).forEach(key => {
    const value = options[key];

    if (Array.isArray(value)) {
      value.forEach(item => {
        kvArray.push(`${key}[]=${item}`);
      });
    } else if (typeof value === "object") {

      // TODO:
    } else if (typeof value === "boolean") {
      kvArray.push(value === true ? `+${key}` : `-${key}`);
    } else {
      kvArray.push(`${key}=${value}`);
    }
  });
  const optionStr = kvArray.join(",");

  if (name) {
    return /\?/.test(name) ? `${name},${optionStr}` : name + (optionStr ? `?${optionStr}` : "");
  }
  return optionStr;
};

loader.getStyleLoaderOption = styleConfig => {
  const loaderOption = {
    loaders: loader.cssLoaders(styleConfig)
  };
  const styleLoaderOption = styleConfig.styleLoaderOption || {};
  if (styleLoaderOption.autoprefixer !== false) {
    loaderOption.postcss = [
      require("autoprefixer")({
        browsers: typeof Array.isArray(styleLoaderOption.autoprefixer) ? styleLoaderOption.autoprefixer : ["last 2 versions", "Firefox ESR", "> 1%", "ie >= 8"]
      })
    ];
  }
  return loaderOption;
};

loader.getStyleLoaderOption = styleConfig => {
  const loaderOption = {
    loaders: loader.cssLoaders(styleConfig)
  };
  const styleLoaderOption = styleConfig.styleLoaderOption || {};
  if (styleLoaderOption.autoprefixer !== false) {
    loaderOption.postcss = [
      require("autoprefixer")({
        browsers: typeof Array.isArray(styleLoaderOption.autoprefixer) ? styleLoaderOption.autoprefixer : ["last 2 versions", "Firefox ESR", "> 1%", "ie >= 8"]
      })
    ];
  }
  return loaderOption;
};

loader.getLoader = (loadersOption, loaderName) => {
  const styleOption = loadersOption[loaderName] || loadersOption[loaderName.replace(/-loader/, "")];

  return loader.getLoaderString(styleOption, require.resolve(loaderName));
};

loader.generateLoaders = (styleConfig, loaders) => {
  const styleLoaderOption = styleConfig.styleLoaderOption || {};
  const styleLoaderName = styleConfig.styleLoaderName || "style-loader";
  const styleLoaderConfig = styleLoaderOption[styleLoaderName] || styleLoaderOption[styleLoaderName.replace(/-loader/, "")];
  const styleLoader = loader.getLoaderString(styleLoaderConfig, require.resolve(styleLoaderName));

  const sourceLoader = loaders.map(item => {
    const option = styleLoaderOption[item] || styleLoaderOption[item.replace(/-loader/, "")];
    return loader.getLoaderString(option, require.resolve(item));
  }).join("!");

  if (styleConfig.extractCss) {
    return ExtractTextPlugin.extract({
      fallback: styleLoader,
      use: sourceLoader
    });
  }

  return [styleLoader, sourceLoader].join("!");
};

loader.cssLoaders = styleConfig => {
  const loaderOption = styleConfig.styleLoaderOption || {};
  const cssLoaders = { css: loader.generateLoaders(styleConfig, ["css-loader", "postcss-loader"]) };
  if (loaderOption.less !== false) {
    cssLoaders['less'] = loader.generateLoaders(styleConfig, ["css-loader", "postcss-loader", "less-loader"]);
  }

  if (loaderOption.scss !== false) {
    cssLoaders['scss'] = loader.generateLoaders(styleConfig, ["css-loader", "postcss-loader", "sass-loader"]);
  }

  if (loaderOption.sass !== false) {
    cssLoaders['sass'] = loader.generateLoaders(styleConfig, ["css-loader", "postcss-loader", "sass-loader"]);
  }
  return cssLoaders;
};

loader.styleLoaders = styleConfig => {
  const output = [];
  const loaders = loader.cssLoaders(styleConfig);

  for (const extension in loaders) {
    const loaderInfo = loaders[extension];

    output.push({
      test: new RegExp(`\\.${extension}$`),
      loader: loaderInfo
    });
  }
  return output;
};

module.exports = loader;
