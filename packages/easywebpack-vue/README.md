# easywebpack-vue

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack-vue.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack-vue
[travis-image]: https://img.shields.io/travis/easy-team/easywebpack-vue.svg?style=flat-square
[travis-url]: https://travis-ci.org/easy-team/easywebpack-vue
[codecov-image]: https://img.shields.io/codecov/c/github/easy-team/easywebpack-vue.svg?style=flat-square
[codecov-url]: https://codecov.io/github/easy-team/easywebpack-vue?branch=master
[david-image]: https://img.shields.io/david/easy-team/easywebpack-vue.svg?style=flat-square
[david-url]: https://david-dm.org/easy-team/easywebpack-vue
[snyk-image]: https://snyk.io/test/npm/easywebpack-vue/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack-vue
[download-image]: https://img.shields.io/npm/dm/easywebpack-vue.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack-vue

Webpack client render and server side render build solution for Vue

## Featues

![easywebpack](https://github.com/easy-team/easywebpack/blob/master/docs/images/easywebpack.png)

see [easywebpack](https://github.com/easy-team/easywebpack)

## Documents

- https://www.yuque.com/easy-team/easywebpack
- https://zhuanlan.zhihu.com/easywebpack

## Version

- easywebpack-vue ^5.x.x > Webpack 5.x.x + Babel 7 
- @easy-team/easywebpack-vue ^4.x.x > Webpack 4.x.x + Babel 7 
- easywebpack-vue ^4.x.x > Webpack 4.x.x + Babel 6
- easywebpack-vue ^3.x.x > Webpack 3.x.x + Babel 6

## Install

```bash
$ npm i easywebpack-vue --save-dev
```

## Usage


### `webpack.config.js`

```js
const easywebpack = require('easywebpack-vue');
const webpack = easywebpack.webpack;
const merge = easywebpack.merge;
const baseWebpackConfig = easywebpack.getWebpackConfig({
    env, // support dev, test, prod 
    target : 'web', // browser mode build
    entry:{
        app: 'src/index.js'
    }
});
module.exports = merge(baseWebpackConfig, {
   
})
```

### use `webpack` command build

```bash
webpack --config webpack.config.js
```

### base `easywebpacack-cli` build mode

```js
const webpackConfig = require('./webpack.config.js');

if (process.env.NODE_SERVER) {
  // development mode: webpack building and start webpack hot server
  easywebpack.server(config);
} else {
  // build file to disk
  easywebpack.build(config);
}
```


## Example

- [vue-client-render-boilerplate](https://github.com/easy-team/easywebpack-cli-template/tree/master/boilerplate/vue) Vue client render boilerplate.

- [egg-vue-webpack-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate) support client render and server render.

- [egg-vue-typescript-boilerplate](https://github.com/easy-team/egg-vue-typescript-boilerplate) Egg + TypeScript + Vue server render boilerplate.

- you can use [easywebpack-cli](https://github.com/easy-team/easywebpack-cli) create client render project or create server side render project for vue.

## Questions & Suggestions

Please open an issue [here](https://github.com/easy-team/easywebpack-vue).

## License

[MIT](LICENSE)
