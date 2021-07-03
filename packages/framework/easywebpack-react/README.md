# easywebpack-react

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack-react.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack-react
[travis-image]: https://img.shields.io/travis/easy-team/easywebpack-react.svg?style=flat-square
[travis-url]: https://travis-ci.org/easy-team/easywebpack-react
[codecov-image]: https://img.shields.io/codecov/c/github/easy-team/easywebpack-react.svg?style=flat-square
[codecov-url]: https://codecov.io/github/easy-team/easywebpack-react?branch=master
[david-image]: https://img.shields.io/david/easy-team/easywebpack-react.svg?style=flat-square
[david-url]: https://david-dm.org/easy-team/easywebpack-react
[snyk-image]: https://snyk.io/test/npm/easywebpack-react/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack-react
[download-image]: https://img.shields.io/npm/dm/easywebpack-react.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack-react

React client render and server side render build solution for Webpack

- easywebpack-react ^5.0.0 > Webpack ^5.0.0 + Babel 7
- @easy-team/easywebpack-react ^4.0.0 > Webpack ^4.0.0 + Babel 7 
- easywebpack-react ^4.0.0 > Webpack ^4.0.0 + Babel 6
- easywebpack-react ^3.0.0 > Webpack ^3.0.0 + Babel 6

## Featues

- ✔︎ React Client Render and Server Side Render Build Mode
- ✔︎ React Single Appliaction and React Mutil Appliaction Build Mode
- ✔︎ Hot Reload, Css Hot Reload, Code Splitting, High Speed, Cache Build, Thread Build
- ✔︎ ES5/ES6/ES7, TypeScript, DLL, Css Module, Dynamic Import, AntD Dynamic Import
- ✔︎ Powerful Tool Chain [easywebpack-cli](https://github.com/easy-team/easywebpack-cli)

## Documents

- https://www.yuque.com/easy-team/easywebpack
- https://zhuanlan.zhihu.com/easywebpack

## Install

```bash
$ npm i easywebpack-react --save-dev
```

## QuickStart

- Install Command Line

```bash
$ npm i easywebpack-cli -g 
```

- Initalize Application

```bash
$ easy init
```

- Running Application

```bash
$ npm start
```

## Configuration

### Write Webpack Config `webpack.config.js`

```js
const easywebpack = require('easywebpack-react');
const webpack = easywebpack.webpack;
const merge = easywebpack.merge;
const webpackConfig = easywebpack.getWebpackConfig({
    env, // support dev, test, prod 
    target : 'web', // browser mode build
    entry:{
      app: 'src/index.js'
    },
    customize(webpackConfig) {
      // ... customize webpack config
      return webpackConfig;
    }
});
```

### Webpack Build

```bash
easy build --webpack
```

OR

```bash
webpack --config webpack.config.js
```


### Application Development & Building

```js
const webpackConfig = require('./webpack.config.js');
const easywebpack = require('easywebpack-react');
const webpackTool = new WebpackTool();
// development mode
easywebpack.server(webpackConfig);
// build file to disk
easywebpack.build(webpackConfig);


## Example

- [react-client-render-boilerplate](https://github.com/easy-team/easywebpack-cli-template/tree/master/boilerplate/react) React client render boilerplate.

- [egg-react-webpack-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate) support client render and server render.

- [egg-react-typescript-boilerplate](https://github.com/easy-team/egg-react-typescript-boilerplate) Egg + TypeScript + React server render boilerplate.

- you can use [easywebpack-cli](https://github.com/easy-team/easywebpack-cli) create client render project or create server side render project for react.


## Questions & Suggestions

Please open an issue [here](https://github.com/easy-team/easywebpack-react).

## License

[MIT](LICENSE)
