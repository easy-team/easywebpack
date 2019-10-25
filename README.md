# easywebpack

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack
[travis-image]: https://travis-ci.org/easy-team/easywebpack.svg?branch=master
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

- ✔︎ Provide Webapck Development and Build Capabilities, Such As Normal Webpack Plugin And Loaders
- ✔︎ Provide Base Capabilities Support, Such As PostCss, Sass, Less, Stylus, Css Module, Service Worker
- ✔︎ Provide Webpack Basic Development And Build Capabilities, Such As Dev server, Hot-Reload, TypeScript, Dll
- ✔︎ Provide Webpack Efficient Development Tool, Such As Bundle Size Analysis, Bundle Build Cost Analysis, Mock Server, HTTP Web Server And So On.
- ✔︎ Provide Multiple Types Of Project Building, Such As React, Vue, Weex, HTML, Weex Application
- ✔︎ Provide Webpack Web (Browser Client Side Render) And Node (Node Server Side Render) Buiding Mode 
- ✔︎ Provide Strong Extend Capabilities For More Front-End Framework


![easywebpack](/docs/images/easywebpack.png)


## Document

- https://www.yuque.com/easy-team/easywebpack
- https://easy-team.github.io/
- https://zhuanlan.zhihu.com/easywebpack


## Install

```bash
$ npm i @easy-team/easywebpack --save-dev
```

## Usage

- Webpack Config

```js
// ${root}/webpack.config.js
const easywebpack = requier('@easy-team/easywebpack');
const env = process.env.BUILD_ENV; // support dev/test/prod
const webpackConfig = easywebpack.getWebpackConfig({
  env,
  target: 'web',
  entry: {
    index: 'src/app.js'
  }
});
module.exports = webpackConfig;
```


## Front-End Framework 

- [easywebpack-vue](https://github.com/easy-team/easywebpack-vue.git) 
- [easywebpack-react](https://github.com/easy-team/easywebpack-react.git)
- [easywebpack-weex](https://github.com/easy-team/easywebpack-weex.git)
- [easywebpack-html](https://github.com/easy-team/easywebpack-html.git) 
- [easywebpack-js](https://github.com/easy-team/easywebpack-js.git) 

## Webpack Command Tool

```bash
npm install easy-team/easywebpack-cli -g
```

#### QuickStart Programming

[easywebpack-cli](https://github.com/easy-team/easywebpack-cli)  Webpack Building Command Line And Boilerplate Init Tool for easywebpack

![easy-init](/docs/images/easy-init.png)

![easy-egg-vue](/docs/images/easy-egg-vue.png)

![easy-egg-react](/docs/images/easy-egg-react.png)

#### Efficient Development

- Use the plugin `webpack-bundle-analyzer` or `stats-webpack-plugin` for webpack build size analysis

  ```
  easy build --size
  ```

  ![easy-build-size](/docs/images/easy-build-size.png)


- Use the plugin `speed-measure-webpack-plugin` for webpack build speed analysis and count the time spent on each loader and plugin

  ```
  easy build --speed
  ```

- support start local file web http server and [data mock service](https://www.yuque.com/easy-team/easywebpack/mock)  by node-http-server 

  ```
  easy server -d mock
  ```



## Application Boilerplate

### Vue/React Client Side Render Application

  - [Vue-Webpack-Boilerplate](https://github.com/easy-team/easywebpack-awesome/tree/master/boilerplate/vue) Vue Front-End Application

  - [React-Wbpack-Boilerplate](https://github.com/easy-team/easywebpack-awesome/tree/master/boilerplate/react) React Front-End Application

### Egg + Vue Server/Client Side Render Webpack Building Application

  - [Egg + Vue Server Side Render Application](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/multi)

  - [Egg + Vue + Vuex + Vue-Router Server Side Render Application](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/spa)

  - [Egg + Vue + Vuex + Vue-Router Client Side Render Application](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/asset)

  - [Egg + Vue + Nunjucks HTML Static Render Application](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/html)

  - [Egg + Element Admin Application](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/element-admin)

  - [Egg + Vue + Typescript Web Application](https://github.com/easy-team/egg-vue-typescript-boilerplate) 和 [ves-admin](https://github.com/easy-team/ves-admin) 


### Egg + React Server/Client Side Render Webpack Building Application


  - [Egg + React Server Side Render Application](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/multi)
  - [Egg + React + Nunjucks HTML Static Render Application](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/html)
  - [Egg + React + Nunjucks HTML Dynamic Render Application](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/asset)
  - [Egg + React + React Router + Redux Single Page Application](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/spa)

  - [Egg + AntD + React Router + Redux + React-Redux](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/easy-admin)

  - [Egg + React + Typescript Web Application](https://github.com/easy-team/egg-react-typescript-boilerplate)


### Weex/HTML Webpack Building Application

  - [Weex-Webpack-Example](https://github.com/easy-team/easywebpack-weex-boilerplate) Weex Front-End Application
  - [Html-Webpack-Example](https://github.com/easy-team/easywebpack-multiple-html-boilerplate) HTML Front-End Application


## Questions & Suggestions

Please open an issue [here](https://github.com/easy-team/easywebpack/issues).

## License

[MIT](LICENSE)
