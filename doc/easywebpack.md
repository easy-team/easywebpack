# easywebpack API and Usage

### extends `WebpackClientBuilder` (`WebpackClientBuilder extends WebpackBaseBuilder`) custom webpack client(browser) build config.

```js
const EasyWebpack = require('easywebpack');
class WebpackClientBuilder extends EasyWebpack.WebpackClientBuilder {
  constructor(config) {
    super(config);
    // call below api custom client builder
  }
}
module.exports = WebpackClientBuilder;
```

webpack client config: `new ClientDevBuilder(config).create()`


### extends `WebpackServerBuilder` (`WebpackServerBuilder extends WebpackBaseBuilder`) custom webpack server(node) build config

```js
const EasyWebpack = require('easywebpack');
class WebpackServerBuilder extends EasyWebpack.WebpackServerBuilder {
  constructor(config) {
    super(config);
    // call below api custom server builder
  }
}
module.exports = WebpackServerBuilder;
```
webpack server config: `new WebpackServerBuilder(config).create()`


### `WebpackBaseBuilder`

- `prod` (boolean) process.env.NODE_ENV === 'production'

       `process.env.NODE_ENV`, default development mode, no hash, no compress, you can call below method change action

- `isMiniCss` (boolean) whether mini css , `this.prod`===true,  mini css, you can call `setMiniCss` method set css whether mini.

- `isUglifyJS` (boolean) whether compress js , `this.prod`===true,  compress css, you can call `setUglifyJs` method set js whether compress.

- `filename` (boolean)  js file name , `this.prod`===true,  client, hash js, you can call `setFileNameHash` method set js whether hash.

- `cssName` (boolean) css file name, when extract css , `this.prod`===true,  hash css, you can call `setCssHash` method set extract css whether hash.

- `imageName` (boolean) image name , `this.prod`===true,  hash image, you can call `setImageHash` method set image whether hash.

- `config` (Object)  WebpackServerBuilder extends WebpackBaseBuilder argument config.

- `options` (Object) webpack config, call `setOption` set.

- `loaders` (Array) webpack config loader, webpack module rules loader, default empty, when call `create` method after, you can get webpack loaders

- `plugins` (Array) webpack config plugin, webpack plugins, default empty, when call `create` method after, you can get webpack plugins


### `WebpackBaseBuilder` public methods


- `setFileNameHash(true/false, len)` : js hash, default len 7.

- `setImageHash(true/false, len)`  :  compress js, default len 7.

- `setCssHash(true/false, len)`  :  css hash, default len 7.

- `setMiniCss(boolean)`  :  whether mini css, default development false, production true.

- `setUglifyJs(boolean)`  :  whether uglify js css, default development false, production true.

- `setCssExtract(boolean)` :  whether extract css file, default `this.prod===true` mode, extract css.

- `setExtensions(string|array)` : webpack resolve extensions config. ex: `this.setExtensions('.vue')`

- `setAlias(name, value)` : webpack resolve alias. ex: `this.setAlias('vue','vue/dist/vue.common.js')`

- `setOption(option)`  : when the basic API provided does not meet the requirements, you can set the webpack configuration by calling the setOption method

- `addLoader(test, loader, option, isHead)`  : add webpack module rules loader, argument `isHead` make sure loader is added to the head or the end

- `addPlugin(clazz, args, isHead)`  : add webpack plugins item, argument `isHead` make sure loader is added to the head or the end

- `createWebpackLoader()`  : configuring the webpack loader configuration based on the configuration of the `loaders`

- `createWebpackPlugin()`  : configuring the webpack plugin configuration based on the configuration of the `plugins`

- `create()`  : call the `createWebpackLoader()` and `createWebpackPlugin()` methods to construct webpack loader and plugin, and merge the options by setOption constructed, the loaders by setLoader constructed, the plugin by setPlugin constructed to return the configuration of the full webpack


### `WebpackClientBuilder`

- set default development client open webpack hot reload

- set default output config

- `plugins` add default config plugin

        default ManifestPlugin, CommonsChunkPlugin, ExtractTextPlugin, HotModuleReplacementPlugin, LoaderOptionsPlugin.

### `WebpackClientBuilder`

- set default output config, `target:node`, `externals` config



## WebpackClientBuilder and WebpackServerBuilder arguments [config]


```js
// default arguments config
const config = {
  baseDir, // project root dir
  build: {
    port: 8090, // webpack-hot-middleware port
    path: 'public', // webpack compile result dir, support absolution path
    publicPath: '/public/', // router prefix
    staticPrefix: 'static', // webpack static resource prefix
    entry: [path.join(baseDir, 'app/web/page')], // webpack entry dir
    commonsChunk: ['vendor'] // webpack.optimize.CommonsChunkPlugin
  }
};
```


## Example


### extend `egg-wepback-vue` webpack build solution

- default common config `base.js`

```js
const EasyWebpack = require('easywebpack');
const defaultWebpackConfig = require('./config');
const merge = EasyWebpack.merge;
const WebpackBaseBuilder = WebpackBuilder => class extends WebpackBuilder {
  constructor(config) {
    super(merge(defaultWebpackConfig, config));
    this.setExtensions('.vue');
    this.setStyleLoaderName('vue-style-loader');
    this.addLoader(/\.vue$/, 'vue-loader', () => {
      return {
        options: EasyWebpack.Loader.getStyleLoaderOption(this.getStyleConfig())
      };
    });
    this.addLoader(/\.html$/, 'vue-html-loader');
  }
};
module.exports = WebpackBaseBuilder;

```

- extends `EasyWebpack.WebpackClientBuilder` create vue WebpackClientBuilder

```js
'use strict';
const EasyWebpack = require('easywebpack');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder(EasyWebpack.WebpackClientBuilder) {
  constructor(config) {
    super(config);
    this.setAlias('vue', 'vue/dist/vue.common.js');
  }

  create() {
    const webpackConfig = super.create();
    EasyWebpack.Utils.saveBuildConfig(this.config, webpackConfig);
    return webpackConfig;
  }
}
module.exports = WebpackClientBuilder;
```


- extends `EasyWebpack.WebpackServerBuilder` create vue WebpackServerBuilder

```js
'use strict';
const EasyWebpack = require('easywebpack');
const WebpackBaseBuilder = require('./base');
class WebpackServerBuilder extends WebpackBaseBuilder(EasyWebpack.WebpackServerBuilder) {
  constructor(config) {
    super(config);
    this.setAlias('vue', 'vue/dist/vue.runtime.common.js');
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