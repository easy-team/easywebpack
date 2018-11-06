# easywebpack

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack
[travis-image]: https://img.shields.io/travis/easy-team/easywebpack.svg?style=flat-square
[travis-url]: https://travis-ci.org/easy-team/easywebpack
[codecov-image]: https://codecov.io/gh/easy-team/easywebpack/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/easy-team/easywebpack
[david-image]: https://img.shields.io/david/easy-team/easywebpack.svg?style=flat-square
[david-url]: https://david-dm.org/easy-team/easywebpack
[snyk-image]: https://snyk.io/test/npm/easywebpack/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack
[download-image]: https://img.shields.io/npm/dm/easywebpack.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack


 A Simple, Powerful Wepback Front-End Development Solution

## Feature

![easywebpack](https://github.com/easy-team/easywebpack/blob/master/docs/images/easywebpack.png)


## Document

- https://www.yuque.com/easy-team/easywebpack
- https://zhuanlan.zhihu.com/easywebpack


## Install

```bash
$ npm i easywebpack --save-dev
```

## Usage

```js
const easywebpack = requier('easywebpack');
const env = process.env.BUILD_ENV; // support dev/test/prod
const webpackConfig = easywebpack.getWebpackConfig({
  env,
  target: 'web',
  entry: {
    index: 'src/app.js'
  }
});
```

## Usage Solution

- [easywebpack-js](https://github.com/easy-team/easywebpack-js.git) 
- [easywebpack-vue](https://github.com/easy-team/easywebpack-vue.git) 
- [easywebpack-react](https://github.com/easy-team/easywebpack-react.git)
- [easywebpack-weex](https://github.com/easy-team/easywebpack-weex.git)
- [easywebpack-html](https://github.com/easy-team/easywebpack-html.git) 

## Webpack Command Tool

[easywebpack-cli](https://github.com/easy-team/easywebpack-cli.git) Webpack Building Command Line And Boilerplate Init Tool for easywebpack

## Application Boilerplate

- [vue-webpack-boilerplate](https://github.com/hubcarl/easywebpack-cli-template/tree/master/boilerplate/vue) Vue Front-End Application

- [react-webpack-boilerplate](https://github.com/hubcarl/easywebpack-cli-template/tree/master/boilerplate/react) React Front-End Application

- [weex-webpack-boilerplate](https://github.com/easy-team/easywebpack-weex-boilerplate) Weex Front-End Application

- [egg-vue-webpack-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate) Egg + Vue Server Side Render Application

- [egg-vue-webpack-spa-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/spa) Egg + Vue Server Side Render Single Page Application

- [egg-vue-webpack-mpa-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/multi) Egg + Vue Server Side Render Multil Page Application

- [egg-vue-typescript-boilerplate](https://github.com/easy-team/egg-vue-typescript-boilerplate) Egg + Vue + TypeScript + Webpack Server Side Render Application

- [egg-react-webpack-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate) Egg + React Server Side Render Application

- [egg-react-webpack-spa-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/spa) Egg + React Server Side Render Single Page Application

- [egg-react-webpack-mpa-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/multi) Egg + React Server Side Render Multil Page Application

- [egg-react-typescript-boilerplate](https://github.com/easy-team/egg-react-typescript-boilerplate) Egg + React + TypeScript + Webpack Server Side Render Application

- [html-webpack-boilerplate](https://github.com/easy-team/easywebpack-multiple-html-boilerplate) HTML Front-End Application


## Questions & Suggestions

Please open an issue [here](https://github.com/easy-team/easywebpack/issues).

## License

[MIT](LICENSE)
