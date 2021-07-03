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


基于 Webpack 的前端构建工程化解决方案 [easywebpack](https://zhuanlan.zhihu.com/p/28322014)

## 安装

```bash
npm install @easy-team/easywebpack --save-dev
```

## 文档与总结

- https://easyjs.cn
- https://www.yuque.com/easy-team/easywebpack
- https://zhuanlan.zhihu.com/easywebpack

## 版本说明

- @easy-team/easywebpack 4.x.x > Webpack 4.x.x + Babel 7
- easywebpack 4.x.x > Webpack 4.x.x + Babel 6
- easywebpack 3.x.x > Webpack 3.x.x + Babel 6


## 基础功能

![easywebpack](https://github.com/easy-team/easywebpack/blob/master/docs/images/easywebpack.png)

- 支持服务端渲染, 前端渲染, 静态页面渲染三种构建方式
- 支持单页面, 多页面服务端渲染构建模式
- 默认支持 `dev`,`test`, `prod` 环境配置
- 集成 `webpack-hot-middleware` 热更新实现, 支持 css inline 和 css extract 热更新
- 支持 entry 原生配置和目录遍历自动构造 entry 功能
- 支持自动根据后缀名构建 entry 文件，比如 `.vue` 和 `.jsx` 文件为入口文件
- 支持 es6 class 继承方式编写 Webpack 配置
- 支持 js/css/image 压缩, 内置支持 CDN 特性
- 支持 css/sass/less/stylus， 支持css module 和 css extract 特性
- 支持 loader 是否启用，合并，覆盖配置
- 支持 plugin 是否启用，合并，覆盖配置
- 支持 loader 和 plugin npm module 是否启用，按需安装
- 支持 eslint, postcss 等特性
- 支持 dll 构建解决方案
- 支持 webpack typescript 构建
- 提供 `easywebpack-cli` 和 `webpack-tool` 辅助工具。

**easywebpack不与任何框架耦合， 你需要基于现有的解决方案使用或者扩展解决方案使用**


## 工程化

![easywebpack](https://github.com/easy-team/easywebpack/blob/master/docs/images/easywebpack.solution.png)

### 解决方案

基于 `easywebpack` 基础骨架，目前已扩展 `Vue` `React` `Weex`, `HTML`, `Javascript` 五种解决方案：
- [easywebpack-js](https://github.com/easy-team/easywebpack-js.git)  支持纯 javascript 文件构建模式
- [easywebpack-vue](https://github.com/easy-team/easywebpack-vue.git)  支持 Vue 纯前端构建和Node端构建模式
- [easywebpack-react](https://github.com/easy-team/easywebpack-react.git) 支持 React 纯前端构建和Node端构建模式
- [easywebpack-weex](https://github.com/easy-team/easywebpack-weex.git) 支持 Native 和 Web 构建模式
- [easywebpack-html](https://github.com/easy-team/easywebpack-html.git) 支持 HTML静态页面模式，支持 nunjucks 引擎

## 使用

```js
// ${root}/webpack.config.js
const easywebpack = requier('@easy-team/easywebpack-react');
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

### 命令行工具

[easywebpack-cli](https://github.com/easy-team/easywebpack-cli.git) 基于 easywebpack 前端工程化解决方案构建的脚手架命令行工具。

- 支持 Vue/React/Weex/HTML 框架项目的初始化，包括 SPA 应用，多页面应用，Server Side Render(Egg)项目
- 支持命令行 Webpack 构建，包括 Webpack 配置信息打印(调试)和获取
- 提供构建结果 UI 导航展现和访问。


### 项目骨架

- [easywebpack-cli-template](https://github.com/easy-team/easywebpack-cli-template) Vue/React/Weex 纯前端项目骨架

- [egg-vue-webpack-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate) Egg + Vue 服务端渲染骨架

- [egg-vue-webpack-spa-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/spa) Egg + Vue 单页面服务端渲染骨架

- [egg-vue-webpack-mpa-boilerplate](https://github.com/easy-team/egg-vue-webpack-boilerplate/tree/feature/green/multi) Egg + Vue 多页面服务端渲染骨架

- [egg-vue-typescript-boilerplate](https://github.com/easy-team/egg-vue-typescript-boilerplate) Egg + Vue + TypeScript + Webpack 服务端渲染骨架

- [egg-react-webpack-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate) Egg + React 服务端渲染骨架

- [egg-react-webpack-spa-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/spa) Egg + React 单页面服务端渲染骨架

- [egg-react-webpack-mpa-boilerplate](https://github.com/easy-team/egg-react-webpack-boilerplate/tree/feature/green/multi) Egg + React 多页面服务端渲染骨架

- [egg-react-typescript-boilerplate](https://github.com/easy-team/egg-react-typescript-boilerplate) Egg + React + TypeScript + Webpack 服务端渲染骨架

- [easywebpack-weex-boilerplate](https://github.com/easy-team/easywebpack-weex-boilerplate) Weex Native 和 Web 构建骨架项目

- [easywebpack-multiple-html-boilerplate](https://github.com/easy-team/easywebpack-multiple-html-boilerplate) 静态页面构建方案骨架，支持纯 HTML 构建 和 nunjucks 构建。 

**以上骨架可以通过 easywebpack-cli 初始化**

## License

[MIT](LICENSE)
