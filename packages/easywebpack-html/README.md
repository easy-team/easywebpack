# easywebpack-html

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack-html.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack-html
[travis-image]: https://img.shields.io/travis/easy-team/easywebpack-html.svg?style=flat-square
[travis-url]: https://travis-ci.org/easy-team/easywebpack-html
[codecov-image]: https://img.shields.io/codecov/c/github/easy-team/easywebpack-html.svg?style=flat-square
[codecov-url]: https://codecov.io/github/easy-team/easywebpack-html?branch=master
[david-image]: https://img.shields.io/david/easy-team/easywebpack-html.svg?style=flat-square
[david-url]: https://david-dm.org/easy-team/easywebpack-html
[snyk-image]: https://snyk.io/test/npm/easywebpack-html/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack-html
[download-image]: https://img.shields.io/npm/dm/easywebpack-html.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack-html

static html webpack build for easywebpack.

- support static html template
- support nunjucks html template

## Version

- easywebpack ^5.x.x > webpack 5.x.x
- easywebpack ^4.x.x > webpack 4.x.x
- easywebpack ^3.x.x > webpack 3.x.x

## Install

```bash
$ npm i easywebpack-html --save-dev
```

## Usage

```js
// build/index.js
const HtmlWebpack = require('easywebpack-html');
const config = {
  entry: {
    index: './src/index.js'
  },
  template: 'view/layout.html'
};

if (process.env.NODE_SERVER) {
  // development mode: webpack building and start webpack hot server
  HtmlWebpack.server(config);
} else {
  // webpack build file to disk
  HtmlWebpack.build(config);
}
```

## Run

```js
{
 "scripts": {
   "build": "cross-env NODE_ENV=development node build",
   "start" : "cross-env NODE_SERVER=true NODE_ENV=development node build"
 }
}
```

```bash

npm start

```

## Example

- [easywebpack-multiple-html-boilerplate](https://github.com/hubcarl/easywebpack-multiple-html-boilerplate) Multiple static html build boilerplate.

- you can use [easywebpack-cli](https://github.com/hubcarl/easywebpack-cli) create multiple static html build boilerplate.
