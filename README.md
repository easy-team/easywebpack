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

- Support server and client webpack general compiler configuration.

- Support custom components such as Vue or React by extending the WebpackClientBuilder or WebpackServerBuilder extension.

- Support development and production build mode, you can set `process.env.NODE_ENV=development` development or `process.env.NODE_ENV=production`.

- Support call `EasyWebpack.build([clientConfig, serverConfig], {}, callback)` direct compiler file.


## Install

```bash
$ npm i easywebpack --save-dev
```

## Usage

### extends `WebpackClientBuilder` (`WebpackClientBuilder extends WebpackBaseBuilder`) custom webpack client(browser) build config.

```js
const EasyWebpack = require('easywebpack');
class WebpackClientBuilder extends EasyWebpack.WebpackClientBuilder {
  constructor(config, options) {
    super(config, options);
    // call below api custom server builder
  }
}
module.exports = WebpackClientBuilder;
```

webpack client config: `new ClientDevBuilder(config).create()`


### extends `WebpackServerBuilder` (`WebpackServerBuilder extends WebpackBaseBuilder`) custom webpack server(node) build config

```js
const EasyWebpack = require('easywebpack');
class WebpackServerBuilder extends EasyWebpack.WebpackServerBuilder {
  constructor(config, options) {
    super(config, options);
    // call below api custom server builder
  }
}
module.exports = WebpackServerBuilder;
```
webpack server config: `new WebpackServerBuilder(config).create()`


### `WebpackBaseBuilder` public property

- `prod` (boolean) process.env.NODE_ENV === 'production'

       `process.env.NODE_ENV`, default development mode, no hash, no compress, you can call below method change action

- `isMiniCss` (boolean) whether mini css , `this.prod`===true,  mini css, you can call `setMiniCss` method set css whether mini.

- `isUglifyJS` (boolean) whether compress js , `this.prod`===true,  compress css, you can call `setUglifyJs` method set js whether compress.

- `filename` (boolean)  js file name , `this.prod`===true,  client, hash js, you can call `setFileNameHash` method set js whether hash.

- `cssName` (boolean) css file name, when extract css , `this.prod`===true,  hash css, you can call `setCssHash` method set extract css whether hash.

- `imageName` (boolean) image name , `this.prod`===true,  hash image, you can call `setImageHash` method set image whether hash.

- `config` (Object)  WebpackServerBuilder extends WebpackBaseBuilder argument config.

- `options` (Object) WebpackServerBuilder extends WebpackBaseBuilder argument options.

- `configLoaders` (Array) when you need dynamic create loader with process.env.NODE_ENV, custom condition, and so on.

       custom loader pattern, default babel-loader, json-loader, url-loader, css-loader, sass-loader, less-loader.

       the one plugin pattern support `dynamic` and loader config property, see the normal and dynamic loader example, dynamic will merge self loader

       {
         test: /\.json$/,
         loader: require.resolve('json-loader')
       },
       {
         test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
         loader: require.resolve('url-loader'),
         query: {
           limit: 1024
         },
         dynamic: () => {
           return {
             query: {
               name: this.imageName
             }
           }
         },
       }


- `configPlugins` (Array) when you need dynamic create plugin with process.env.NODE_ENV, custom condition, and so on.

        custom plugin pattern, default NoEmitOnErrorsPlugin, ProgressBarPlugin, UglifyJsPlugin.

        the one plugin pattern support `enable`, `clazz`, `args` config property, see the normal and dynamic plugin example

        {
            clazz: ProgressBarPlugin,
            args: {
              width: 100,
              format: 'webpack build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
              clear: false
            },
        },
        {
            enable: () => { // enable not must need, default enable true
              return this.isUglifyJS;
            },
            clazz: webpack.optimize.UglifyJsPlugin, // clazz must need, and support contructor create object
            args: () => { // args not must need
              return {
                compress: {
                  warnings: false,
                  dead_code: true,
                  drop_console: true,
                  drop_debugger: true
                }
              }
            }
        }

- `loaders` (Array) webpack config loader, webpack module rules loader, default empty, when call `create` method after, you can get webpack loaders

- `plugins` (Array) webpack config plugin, webpack plugins, default empty, when call `create` method after, you can get webpack plugins


### `WebpackBaseBuilder` public methods


- `setFileNameHash(true/false, len)` : js hash, default len 7.

- `setImageHash(true/false, len)`  :  compress js, default len 7.

- `setCssHash(true/false, len)`  :  css hash, default len 7.

- `setMiniCss(boolean)`  :  whether mini css, default development false, production true.

- `setUglifyJs(boolean)`  :  whether uglify js css, default development false, production true.

- `setCssExtract(boolean)` :  whether extract css file, default `this.prod===true` mode, extract css.

- `setOption(option)`  : when the basic API provided does not meet the requirements, you can set the webpack configuration by calling the setOption method

- `setConfigLoader(loader, isHead) `  : add custom config loader, support single and multiple, argument `isHead` make sure config loader is added to the head or the end.

- `setConfigPlugin(plugin, isHead)`  : add custom config plugin, support single and multiple,  argument `isHead` make sure config plugin is added to the head or the end

- `setLoader(loader, isHead)`  : add webpack module rules loader, support single and multiple, argument `isHead` make sure loader is added to the head or the end

- `setPlugin(plugin, isHead)`  : add webpack plugins item, support single and multiple, argument `isHead` make sure loader is added to the head or the end

- `createWebpackLoader()`  : configuring the webpack loader configuration based on the configuration of the `configLoaders`

- `createWebpackPlugin()`  : configuring the webpack plugin configuration based on the configuration of the `configPlugins`

- `create()`  : call the `createWebpackLoader()` and `createWebpackPlugin()` methods to construct webpack loader and plugin, and merge the options by setOption constructed, the loaders by setLoader constructed, the plugin by setPlugin constructed to return the configuration of the full webpack

- `getWebpackConfig()` : return the configuration of the full webpack



### `WebpackClientBuilder`

- set default development client open webpack hot reload

- set default output config

- `configPlugins` add default config plugin

        default ManifestPlugin, CommonsChunkPlugin, ExtractTextPlugin, HotModuleReplacementPlugin, LoaderOptionsPlugin.

### `WebpackClientBuilder`

- set default output config, `target:node`, `externals` config



## WebpackClientBuilder and WebpackServerBuilder arguments [config]

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


## Example


### extend `egg-wepback-vue` webpack build solution

- default common config `config.js`

```js
'use strict';
const EasyWebpack = require('easywebpack');
const webpack = EasyWebpack.webpack;
const merge = EasyWebpack.merge;

exports.getLoader = config => {
  return [
    {
      test: /\.vue$/,
      loader: require.resolve('vue-loader'),
      dynamic: () => {
        return {
          options: EasyWebpack.Loader.getStyleLoaderOption(config)
        };
      }
    },
    {
      test: /\.html$/,
      loader: require.resolve('vue-html-loader')
    }
  ];
};

exports.initBase = options => {
  return merge({
    resolve: {
      extensions: ['.vue']
    }
  }, options);
};

exports.initClient = options => {
  return merge(exports.initBase(options), {
    resolve: {
      alias: {
        vue: 'vue/dist/vue.common.js'
      }
    }
  }, options);
};

exports.initServer = options => {
  return merge(exports.initBase(options), {
    resolve: {
      alias: {
        vue: 'vue/dist/vue.runtime.common.js'
      }
    },
    plugins: [
      // 配置 vue 的环境变量，告诉 vue 是服务端渲染，就不会做耗性能的 dom-diff 操作了
      new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"server"'
      })
    ]
  }, options);
};

```

- extends `EasyWebpack.WebpackClientBuilder` create vue WebpackClientBuilder

```js
const EasyWebpack = require('easywebpack');
const baseConfig = require('./config');
const Utils = require('./utils');
class WebpackClientBuilder extends EasyWebpack.WebpackClientBuilder {
  constructor(config, options) {
    super(config, options);
    this.setOption(baseConfig.initClient());
    this.setConfigLoader(baseConfig.getLoader(this.config), true);
  }
}
module.exports = WebpackClientBuilder;
```


- extends `EasyWebpack.WebpackServerBuilder` create vue WebpackServerBuilder

```js
const EasyWebpack = require('easywebpack');
const baseConfig = require('./config');
class WebpackServerBuilder extends EasyWebpack.WebpackServerBuilder {
  constructor(config, options) {
    super(config, options);
    this.setOption(baseConfig.initServer());
    this.setConfigLoader(baseConfig.getLoader(this.config), true);
  }
}
module.exports = WebpackServerBuilder;
```


### use `egg-wepback-vue` solution

- webpack client and server common `base.js`

```js
const path = require('path');
exports.config = require('../../config/webpackConfig');
exports.getOption = config => {
  return {
    entry: {
      vendor: ['vue']
    },
    resolve: {
      alias: {
        asset: path.join(config.baseDir, 'app/web/asset'),
        app: path.join(config.baseDir, 'app/web/framework/vue/app'),
        component: path.join(config.baseDir, 'app/web/component'),
        framework: path.join(config.baseDir, 'app/web/framework'),
        store: path.join(config.baseDir, 'app/web/store')
      }
    }
  };
};
```

- create webpack client build config `client.base.js`, `client.dev.js`, `client.prod.js`


`client.base.js` client dev and prod mode common config

```js
const EggWebpackVue = require('egg-webpack-vue');
const base = require('./base');

class ClientBuilder extends EggWebpackVue.WebpackClientBuilder {
  constructor() {
    super(base.config);
    this.setOption(base.getOption(base.config));
  }
}
```

`client.dev.js` client dev mode config, default no hash, no mini css, no uglify js

```js
class ClientDevBuilder extends ClientBuilder {
  constructor() {
    super();
    this.setEggWebpackPublicPath();
    this.setDevTool('eval-source-map');
    this.setCssExtract(false);
  }
}
module.exports = new ClientDevBuilder().create();
```

`client.prod.js` client prod mode config, hash js/css/image, mini css, uglify js

```js
class ClientProdBuilder extends ClientBuilder {
  constructor() {
    super();
    this.setCssExtract(true);
  }
}
module.exports = new ClientProdBuilder().create();
```



- create webpack server build config `server.base.js`, `server.dev.js`, `server.prod.js`


`server.base.js` server dev and prod mode common config

```js
const EggWebpackVue = require('egg-webpack-vue');
const base = require('../base');
class ServerBuilder extends EggWebpackVue.WebpackServerBuilder {
  constructor() {
    super(base.config);
    this.setOption(base.getOption(base.config));
  }
}

module.exports = ServerBuilder;
```

`server.dev.js` server dev mode config

```js
const ServerBaseBuilder = require('./base');
class ServerDevBuilder extends ServerBaseBuilder {
  constructor() {
    super();
    // use egg-webpack plugin need set
    this.setEggWebpackPublicPath();
  }
}

module.exports = new ServerDevBuilder().create();
```

`server.prod.js` server prod mode config

```js
const ServerBaseBuilder = require('./base');
class ServerProdBuilder extends ServerBaseBuilder {
}

module.exports = new ServerProdBuilder().create();
```

- bash command build `build.js`

build.js

```js
const EggWebpackVue = require('egg-webpack-vue');
const clientConfig = require('./build/client.dev');
const serverConfig = require('./build/server.dev');
EggWebpackVue.EasyWebpack.build([clientConfig, serverConfig], {}, () => {
  console.log('wepback vue build finished');
});
```

package.json:

```bash
{
  "scripts": {
      "build-dev": "NODE_ENV=development node build",
      "build-prod": "NODE_ENV=production node build"
   }
}
```

bash run

```bash
npm run build-dev
npm run build-prod
```

## easywebpack extend solution and project

- more detail, please see [WebpackClientBuilder](https://github.com/hubcarl/easywebpack/blob/master/builder/client.js) and [WebpackServerBuilder](https://github.com/hubcarl/easywebpack/blob/master/builder/server.js)

- custom webpack build solution base on easywebpack, please see custom plugin [egg-webpack-vue](https://github.com/hubcarl/egg-webpack-vue) for easywebpack + vue

- webpack+vue project boilerplate [egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate) base on egg-webpack-vue and egg-webpack.


## Questions & Suggestions

Please open an issue [here](https://github.com/hubcarl/easywebpack/issues).

## License

[MIT](LICENSE)