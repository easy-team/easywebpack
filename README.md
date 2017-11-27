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

![easywebpack](https://github.com/hubcarl/easywebpack/blob/master/docs/images/easywebpack.png)

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

- http://hubcarl.github.io/easywebpack
- https://zhuanlan.zhihu.com/easywebpack


## Install

```bash
$ npm i easywebpack --save-dev
```

## Webpack Build Solution

- [easywebpack-vue](https://github.com/hubcarl/easywebpack-vue.git) 
- [easywebpack-react](https://github.com/hubcarl/easywebpack-react.git)
- [easywebpack-weex](https://github.com/hubcarl/easywebpack-weex.git)
- [easywebpack-html](https://github.com/hubcarl/easywebpack-html.git) 

## Webpack Command Tool

[easywebpack-cli](https://github.com/hubcarl/easywebpack-cli.git) Webpack Building Command Line And Boilerplate Init Tool for easywebpack

## Project Boilerplate

- [easywebpack-cli-template](https://github.com/hubcarl/easywebpack-cli-template) Config template and client render boilerplate template

- [egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate) support vue server side render and client render

- [egg-react-webpack-boilerplate](https://github.com/hubcarl/egg-react-webpack-boilerplate) support react server side render and client render

- [easywebpack-weex-boilerplate](https://github.com/hubcarl/easywebpack-weex-boilerplate) support weex native build and web build

- [easywebpack-multiple-html-boilerplate](https://github.com/hubcarl/easywebpack-multiple-html-boilerplate) support static html or nunjucks template webpack build


**Note: you can use [easywebpack-cli](https://github.com/hubcarl/easywebpack-cli.git) init above project.**


## Configuration

- see [easywebpack config](http://hubcarl.github.io/easywebpack/webpack/config/) for more detail.
- see [extend easywebpack](http://hubcarl.github.io/easywebpack/webpack/install/) for extend solution.

## Questions & Suggestions

Please open an issue [here](https://github.com/hubcarl/easywebpack/issues).

## License

[MIT](LICENSE)
