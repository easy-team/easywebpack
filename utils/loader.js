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

loader.getStyleLoaderOption = config => ({
  postcss: [
    require("autoprefixer")({
      browsers: ["last 2 versions", "Firefox ESR", "> 1%", "ie >= 8"]
    })
  ],
  loaders: loader.cssLoaders(config)
});

loader.getLoader = (loadersOption, loaderName) => {
  const styleOption = loadersOption[loaderName] || loadersOption[loaderName.replace(/-loader/, "")];

  return loader.getLoaderString(styleOption, require.resolve(loaderName));
};

loader.generateLoaders = (config, loaders) => {
  const loaderOption = config.webpack.loaderOption;
  const styleLoaderName = config.webpack.styleLoader || "style-loader";
  const styleLoaderOption = loaderOption[styleLoaderName] || loaderOption[styleLoaderName.replace(/-loader/, "")];
  const styleLoader = loader.getLoaderString(styleLoaderOption, require.resolve(styleLoaderName));

  const sourceLoader = loaders.map(item => {
    const option = loaderOption[item] || loaderOption[item.replace(/-loader/, "")];

    return loader.getLoaderString(option, require.resolve(item));
  }).join("!");

  if (config.extractCss) {
    return ExtractTextPlugin.extract({
      fallback: styleLoader,
      use: sourceLoader
    });
  }

  return [styleLoader, sourceLoader].join("!");
};

loader.cssLoaders = config => ({
  css: loader.generateLoaders(config, ["css-loader", "postcss-loader"]),
  less: loader.generateLoaders(config, ["css-loader", "postcss-loader", "less-loader"]),
  scss: loader.generateLoaders(config, ["css-loader", "postcss-loader", "sass-loader"]),
  sass: loader.generateLoaders(config, ["css-loader", "postcss-loader", "sass-loader"])
});

loader.styleLoaders = config => {
  const output = [];
  const loaders = loader.cssLoaders(config);

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
