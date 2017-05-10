# easywebpack

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack
[travis-image]: https://img.shields.io/travis/hubcarl/easywebpack.svg?style=flat-square
[travis-url]: https://travis-ci.org/hubcarl/easywebpack
[codecov-image]: https://img.shields.io/codecov/c/github/hubcarl/easywebpack.svg?style=flat-square
[codecov-url]: https://codecov.io/github/hubcarl/easywebpack?branch=master
[david-image]: https://img.shields.io/david/hubcarl/easywebpack.svg?style=flat-square
[david-url]: https://david-dm.org/hubcarl/easywebpack
[snyk-image]: https://snyk.io/test/npm/easywebpack/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack
[download-image]: https://img.shields.io/npm/dm/easywebpack.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack

programming instead of configuration, webpack is no longer complex.

- Support server and client webpack General Compiler configuration.

- Support custom components such as Vue or React by extending the WebpackClientBuilder or WebpackServerBuilder extension.

- Support development and production build mode, you can set `process.env.NODE_ENV=development` development or `process.env.NODE_ENV=production`.

- Support call `EasyWebpack.build([clientConfig, serverConfig], {}, callback)` direct compiler file.


## Install

```bash
$ npm i easywebpack --save-dev
```

## Usage

#### 一. `process.env.NODE_ENV`, default development mode, no hash, no compress, you can call below method change action

- `setUglifyJs(true/false, len)`  compress js, default len 7

- `setFileNameHash(true/false, len)`  js hash, default len 7

- `setImageHash(true/false, len)`  compress js, default len 7

- `setCssHash(true/false, len)`  css hash, default len 7


#### 二.WebpackClientBuilder and WebpackServerBuilder arguments [config]

```js
const config = {
  baseDir, // project root dir
  build: {
    port: 8090, // webpack-hot-middleware port
    path: 'public', // webpack compile result dir, support absolution path
    publicPath: '/public/', // router prefix
    prefix: 'static', // webpack static resource prefix
    entry: [path.join(baseDir, 'app/web/page')], // webpack entry dir
    commonsChunk: ['vendor'] // webpack.optimize.CommonsChunkPlugin
  },
  webpack: {
    styleLoader: 'vue-style-loader', // file process loader, default style-loader
    extractCss: true, // false: css inline html , otherwise extract style in css file
    loaderOption: {  // loader custom option or query
      sass: {
        includePaths: [path.join(baseDir, 'app/web/asset/style')] // sass @import search dir
      }
    },
    pluginOption: {} // plugin custom option
  }
};
```

#### 三.custom webpack client build config

```js
'use strict';
const EasyWebpack = require('easywebpack');
class WebpackClientBuilder extends EasyWebpack.WebpackClientBuilder {
  constructor(config, options) {
    super(config, options);
    this.setOption({
      resolve: {
        extensions: ['.vue']
      },
      alias: {
        vue: 'vue/dist/vue.common.js'
      }
    });
    this.setLoader([
      {
        test: /\.vue$/,
        loader: require.resolve('vue-loader'),
        options: EasyWebpack.Loader.getStyleLoaderOption(config)
      },
      {
        test: /\.html$/,
        loader: require.resolve('vue-html-loader')
      }
    ]);
  }
  create() {
    const webpackConfig = super.create();
    // ....can you modify webpackConfig
    return webpackConfig;
  }
}
module.exports = WebpackClientBuilder;
```

#### 四.custom webpack build config

```js
'use strict';
const EasyWebpack = require('easywebpack');
class WebpackServerBuilder extends EasyWebpack.WebpackServerBuilder {
  constructor(config, options) {
    super(config, options);
    this.config.webpack.extractCss = false;
    this.setOption({
      resolve: {
        extensions: ['.vue'],
        alias: {
          vue: 'vue/dist/vue.runtime.common.js'
        }
      }
    });
    this.setLoader([
      {
        test: /\.vue$/,
        loader: require.resolve('vue-loader'),
        options: EasyWebpack.Loader.getStyleLoaderOption(this.config)
      },
      {
        test: /\.html$/,
        loader: require.resolve('vue-html-loader')
      }
    ]);
  }
}
module.exports = WebpackServerBuilder;
```

- custom engine, please see custom plugin [egg-webpack-vue](https://github.com/hubcarl/egg-webpack-vue) for easywebpack + vue

- more detail, please see [WebpackClientBuilder](https://github.com/hubcarl/easywebpack/blob/master/builder/client.js) and [WebpackServerBuilder](https://github.com/hubcarl/easywebpack/blob/master/builder/server.js)


## Questions & Suggestions

Please open an issue [here](https://github.com/hubcarl/easywebpack/issues).

## License

[MIT](LICENSE)