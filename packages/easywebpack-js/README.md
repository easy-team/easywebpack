# easywebpack-js


[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack-js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack-js
[travis-image]: https://img.shields.io/travis/hubcarl/easywebpack-js.svg?style=flat-square
[travis-url]: https://travis-ci.org/hubcarl/easywebpack-js
[codecov-image]: https://codecov.io/gh/hubcarl/easywebpack-js/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/hubcarl/easywebpack-js
[david-image]: https://img.shields.io/david/hubcarl/easywebpack-js-js.svg?style=flat-square
[david-url]: https://david-dm.org/hubcarl/easywebpack-js
[snyk-image]: https://snyk.io/test/npm/easywebpack-js/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easywebpack-js
[download-image]: https://img.shields.io/npm/dm/easywebpack-js.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack-js

Buiding JavaScript Lib for Webpack

## Install

- Webpack 4

```bash

$ npm i @easy-team/easywebpack-js --save-dev      // babel 7

or

$ npm i easywebpack-js --save-dev                 // babel 6


```

- Webpack 3

```bash
$ npm i easywebpack-js@3 --save-dev
```

## Document

- https://yueque.com/easy-team
- http://easyjs.cn


## QuickStart

### Webapck Building Script

#### Node Build Mode

- write webpack build config

```js
// build/index.js
const easywebpack = require('easywebpack-js');
const config = {
  env: process.env.BUILD_ENV,
  entry: {
    'index': 'lib/index.js'
  }
};
easywebpack.build(config);
```

- build script command

```js
{
 "scripts": {
   "build:test": "cross-env BUILD_ENV=test NODE_ENV=development node build/index.js",
   "build:prod": "cross-env BUILD_ENV=prod NODE_ENV=production node build/index.js",
 }
}
```


#### easywebpack-cli

- write easywebpack-cli for easywebpack-js solution

```js
// ${app_root}/webpack.config.js
const easywebpack = require('@easy-team/easywebpack-js');
module.exports = {
  framework: 'js',
  entry: {
    'index': 'lib/index.js'
  }
};
```

- easywebpack-cli command build

```js
{
 "scripts": {
   "build:test": "easy build test",
   "build:prod": "easy build prod",
 }
}
```

### Building Webpack Common Script Lib

#### Write React Lib Entry Code

> ${root}/src/react-lib.js
 
```js
import React from 'react';
import ReactDOM from 'react-dom';

// window.React = React;
// window.ReactDOM = ReactDOM;

export default {
  React,
  ReactDOM
}
```

#### Webpack React Lib Building

> ${root}/webpack.config.js

```javascript
module.exports = {
  framework: 'js',
  entry: {
    'react-lib': 'scr/react-lib.js'
  },
  output: {
    library: "ReactLib" 
  }
}
```

#### Project Webpack Config

> ${root}/webpack.config.js

```js
module.exports = {
  ....
  externals: {
    'react': 'ReactLib.default.React',
    'react-dom': 'ReactLib.default.ReactDOM'
  },
}
```

#### HTML Script Link

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>React Common Lib Test</title>
    <script src="/react-lib.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

## Example

 - [react-common-lib](/example/react-common-lib) React common lib and example 

    ![](/doc/images/react-lib.png)

 - [vue-common-lib](/example/vue-common-lib) Vue common lib and example

    ![](/doc/images/vue-lib.png)


## License

[MIT](LICENSE)