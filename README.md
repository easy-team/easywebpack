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


基于 Webpack 的前端构建工程化解决方案 [easywebpack](https://zhuanlan.zhihu.com/p/28322014)


## 文档与总结

- http://hubcarl.github.io/easywebpack
- https://zhuanlan.zhihu.com/easywebpack

## 版本说明

最新版本基于 Webpack 3 版本， 目前 `easywebpack` 稳定版本：～3.6.x  `easywebpack` 新特性版本: next. 对应的 Vue/React/Weex 解决方案也分别有对应的稳定版和新特性版本， 线上使用时请使用稳定版本。 以 Vue 稳定版和开发版本安装举例：


```bash
npm install easywebpack-vue --save-dev
```

## 基础功能

![easywebpack](https://github.com/hubcarl/easywebpack/blob/master/docs/images/easywebpack.png)

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

![easywebpack](https://github.com/hubcarl/easywebpack/blob/master/docs/images/easywebpack.solution.png)

### 解决方案

基于 `easywebpack` 基础骨架，目前已扩展 `Vue` `React` `Weex`, `HTML` 四种解决方案：

- [easywebpack-vue](https://github.com/hubcarl/easywebpack-vue.git)  支持 Vue 纯前端构建和Node端构建模式
- [easywebpack-react](https://github.com/hubcarl/easywebpack-react.git) 支持 React 纯前端构建和Node端构建模式
- [easywebpack-weex](https://github.com/hubcarl/easywebpack-weex.git) 支持 Native 和 Web 构建模式
- [easywebpack-html](https://github.com/hubcarl/easywebpack-html.git) 支持 HTML静态页面模式，支持 nunjucks 引擎


### 命令行工具

[easywebpack-cli](https://github.com/hubcarl/easywebpack-cli.git) 基于 easywebpack 前端工程化解决方案构建的脚手架命令行工具。

- 支持 Vue/React/Weex 框架项目的初始化，包括 SPA应用，多页面应用，Server Side Render(Egg)项目
- 支持命令行 Webpack 构建，包括Webpack配置信息打印(调试)和获取
- 提供构建结果 UI 导航展现和访问。


### 项目骨架

- [easywebpack-cli-template](https://github.com/hubcarl/easywebpack-cli-template) Vue/React/Wee 纯前端项目目标

- [egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate) Egg + Vue 服务端渲染骨架

- [egg-react-webpack-boilerplate](https://github.com/hubcarl/egg-react-webpack-boilerplate) Egg + React 服务端渲染骨架

- [easywebpack-weex-boilerplate](https://github.com/hubcarl/easywebpack-weex-boilerplate) Weex Native 和 Web 构建骨架项目
- [easywebpack-multiple-html-boilerplate](https://github.com/hubcarl/easywebpack-multiple-html-boilerplate) 静态页面构建方案骨架，支持纯 HTML 构建 和 nunjucks 构建。 

**以上骨架可以通过 easywebpack-cli 初始化**

## License

[MIT](LICENSE)
