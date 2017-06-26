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

programming instead of configuration, webpack is no longer complex. [API Document And Example](https://github.com/hubcarl/easywebpack/blob/master/doc/easywebpack.md).

- Support server and client webpack general compiler configuration.

- Support custom components such as Vue or React by extending the WebpackClientBuilder or WebpackServerBuilder extension.

- Support development and production build mode, you can set `process.env.NODE_ENV=development` development or `process.env.NODE_ENV=production`.

- Support call `EasyWebpack.build(webpackConfig, callback)` direct compiler file.

- Support call `EasyWebpack.server(webpackConfig)` start webpack dev server.


## Install

```bash
$ npm i easywebpack --save-dev
```

webpack solution: [easywebpack-vue](https://github.com/hubcarl/easywebpack-vue.git) and [easywebpack-weex](https://github.com/hubcarl/easywebpack-weex.git)

## Usage

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


### webpack build

- bash command build `build.js`


```js
const EggWebpack = require('easywebpack');
const clientConfig = require('./build/client');
const serverConfig = require('./build/server');
EggWebpack.build([clientConfig, serverConfig], () => {
  console.log('wepback vue build finished');
});
```

- package.json:

```bash
{
  "scripts": {
      "build-dev": "NODE_ENV=development node build",
      "build-prod": "NODE_ENV=production node build"
   }
}
```

- bash run

```bash
npm run build-dev
npm run build-prod
```

## Configuration

see [builder/config.js](builder/config.js) for more detail.

## easywebpack extend solution and project boilerplate

- more detail, please see [WebpackClientBuilder](https://github.com/hubcarl/easywebpack/blob/master/lib/client.js) and [WebpackServerBuilder](https://github.com/hubcarl/easywebpack/blob/master/lib/server.js)

- custom webpack build solution base on easywebpack, please see custom plugin [egg-webpack-vue](https://github.com/hubcarl/egg-webpack-vue) for easywebpack + vue

- webpack+vue project boilerplate [egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate) base on egg-webpack-vue and egg-webpack.


## Questions & Suggestions

Please open an issue [here](https://github.com/hubcarl/easywebpack/issues).

## License

[MIT](LICENSE)
