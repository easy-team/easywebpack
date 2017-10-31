# easywebpack

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack
[travis-image]: https://img.shields.io/travis/hubcarl/easywebpack.svg?style=flat-square
[travis-url]: https://travis-ci.org/hubcarl/easywebpack
[codecov-image]: https://codecov.io/gh/hubcarl/easywebpack/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/hubcarl/easywebpack
[david-image]: https://img.shields.io/david/hubcarl/easywebpack.svg?style=flat-square
[david-url]: https://david-dm.org/hubcarl/easywebpack
[snyk-image]: https://snyk.io/test/npm/easywebpack/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack
[download-image]: https://img.shields.io/npm/dm/easywebpack.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack


programming instead of configuration, webpack is no longer complex. the support feature:

![easywebpack](https://github.com/hubcarl/easywebpack/blob/master/doc/images/easywebpack.png)

- Support Webpack3 (easywebpack 3.x.x) 和 Webpack2 (easywebpack 1.x.x)

- Support server render build or client render build by easywebpack configuration.

- Support Multi-page and Single-page webpack build.

- Support auto build webpack entry by `.vue` and `.jsx`.

- Support hot-reload and  javascript/css/image `compress`, `mini`, `hash`. 

- Support `dev`, `test`, `prod` build mode, you can call `setEnv(evn)` set.

- Support call `EasyWebpack.build(webpackConfig, options, callback)` direct compiler file.

- Support call `EasyWebpack.server(webpackConfig, options, callback)` start webpack dev server.

- Support custom components such as Vue or React by extending the WebpackClientBuilder or WebpackServerBuilder extension.


## Document

- [使用文档](http://hubcarl.github.io/easywebpack)
- [技术文档](https://zhuanlan.zhihu.com/easywebpack)
- [配置参数](http://hubcarl.github.io/easywebpack/webpack/config/)
- [API Document](http://hubcarl.github.io/easywebpack/webpack/api/)
- [Example](http://hubcarl.github.io/easywebpack/vue/easywebpack-vue-project/)


## Install

```bash
$ npm i easywebpack --save-dev
```

## Build Solution

- [easywebpack-vue](https://github.com/hubcarl/easywebpack-vue.git) 
- [easywebpack-react](https://github.com/hubcarl/easywebpack-react.git)
- [easywebpack-weex](https://github.com/hubcarl/easywebpack-weex.git)

## Webpack Command Tool

[easywebpack-cli](https://github.com/hubcarl/easywebpack-cli.git) Webpack Building Command Line And Boilerplate Init Tool for easywebpack

## Project Boilerplate

- [easywebpack-cli-template](https://github.com/hubcarl/easywebpack-cli-template)

- [egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate) support vue server side render and client render

- [egg-react-webpack-boilerplate](https://github.com/hubcarl/egg-react-webpack-boilerplate) support react server side render and client render

- [easywebpack-weex-boilerplate](https://github.com/hubcarl/easywebpack-weex-boilerplate) support weex native build and web build

**Note: you can use [easywebpack-cli](https://github.com/hubcarl/easywebpack-cli.git) init project.**

## Configuration

- see [config](config) for more detail.

- more detail, please see [WebpackClientBuilder](https://github.com/hubcarl/easywebpack/blob/master/lib/client.js) and [WebpackServerBuilder](https://github.com/hubcarl/easywebpack/blob/master/lib/server.js)


## Solution Implementation

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

Webpack client config: `new ClientDevBuilder(config).create()`


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
const EasyWebpack = require('easywebpack');
const clientConfig = require('./build/client');
const serverConfig = require('./build/server');
EasyWebpack.build([clientConfig, serverConfig], {}, () => {
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

## Questions & Suggestions

Please open an issue [here](https://github.com/hubcarl/easywebpack/issues).

## License

[MIT](LICENSE)
