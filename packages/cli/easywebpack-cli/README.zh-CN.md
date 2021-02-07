# easywebpack-cli

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/easywebpack-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easywebpack-cli
[travis-image]: https://img.shields.io/travis/hubcarl/easywebpack-cli.svg?style=flat-square
[travis-url]: https://travis-ci.org/hubcarl/easywebpack-cli
[codecov-image]: https://codecov.io/gh/hubcarl/easywebpack-cli/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/hubcarl/easywebpack-cli
[david-image]: https://img.shields.io/david/hubcarl/easywebpack-cli.svg?style=flat-square
[david-url]: https://david-dm.org/hubcarl/easywebpack-cli
[download-image]: https://img.shields.io/npm/dm/easywebpack-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/easywebpack-cli

easywebpack cli 命令行工具 for [easywebpack](https://github.com/hubcarl/easywebpack.git), 支持常用骨架初始化, Webpack 编译功能

## 一.特性

- 支持 `HTML` 静态多页面 Webpack 构建
- 支持 `Vue`,`React`, `Weex` Webpack 编译和Server功能
- 支持 `Vue`,`React`, `Weex` easywepback-cli 配置初始化[easywebpack-cli-template](https://github.com/hubcarl/easywebpack-cli-template.git)
- 支持 `Vue`,`React`, `Weex` webpack config build 配置初始化[easywebpack-cli-template](https://github.com/hubcarl/easywebpack-cli-template.git)
- 支持 `Vue`,`React`, `Weex` client render boilerplate 项目初始化[easywebpack-cli-template](https://github.com/hubcarl/easywebpack-cli-template.git)
- 支持 `Vue`,`React` server side boilerplate 多页面和单页面项目初始化[egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate.git), [egg-react-webpack-boilerplate](https://github.com/hubcarl/egg-react-webpack-boilerplate.git)
- 支持 `Egg + TypeScript + Vue/React` server side boilerplate 项目初始化[egg-vue-typescript-boilerplate](https://github.com/hubcarl/egg-vue-typescript-boilerplate.git), - [egg-react-typescript-boilerplate](https://github.com/hubcarl/egg-react-typescript-boilerplate.git)
- 支持 `easy open [dir]`, `easy kill [port], easy clean [dir]` 常用命令 
- 支持 `npm package` 项目初始化, 内置ESlint, 单元测试, 覆盖率, CI构建

## 二. 安装

- @easy-team/easywebpack-cli -> @easy-team/easywebpack (Babel 7)
- easywebpack-cli -> easywebpack (Babel 6)

```bash
$ npm i @easy-team/easywebpack-cli -g
```

按照成功后, 可以在命令行使用全局命令 `easywebpack` or `easy`


## 三. 运行


```bash
easy -h
```

Usage: easy [command] [options]


  Options:

    -V, --version          output the version number
    -f, --filename [path]  webpack config file path
    -p, --port [port]      webpack server port
    -s, --size [option]    webpack build size analyzer tool, support size: analyzer and stats, default analyzer
    --dll                  only webpack dll config
    --web                  only webpack web config
    --node                 only webpack node config
    --speed                stat webpack build speed
    --devtool [devtool]    webpack devtool config
    -h, --help             output usage information

  Commands:

    init [options]         init webpack config or boilerplate for Vue/React/Weex
    install [options]      dynamic install easywebpack missing npm module
    upgrade [options]      upgrade project package to latest version
    print [options] [env]  print webpack config, support print by env or config node key
    dll [env]              webpack dll build
    build [options] [env]  webpack building
    server [options]       static file web http server
    dev [env]              start webpack dev server for develoment mode
    start [env]            start webpack dev server for develoment mode
    zip [options]          archive files to zip file
    tar [options]          archive files to tar file
    deploy                 upload file to deplay space
    clean [dir]            webpack cache dir clean, if dir == "all", will clean cache dir and build dir
    open [dir]             open webpack cache dir
    kill [port]            kill port process, default will kill 7001, 9000, 9001


## 四. 常用命令介绍

### 4.1 配置模板和Boilerplate初始化

- easy init

> step one:

![step one](/doc/easy-init-step-one.png)

> step two:

![step two](/doc/easy-init-step-two.png)


### 4.2 编译举例

- easy build

- easy build -f build/webpack.config.js

- easy build dev

- easy build test

- easy build prod 

- easy build --server  编译后启动 HTTP 静态文件访问服务

默认读取项目根目录下的 `webpack.config.js` 配置

### 4.3 编译和启动服务举例

- easy server

- easy server -f build/webpack.config.js

- easy server dev

- easy server test

- easy server prod

- easy server -b wmc 

默认读取项目根目录下的 `webpack.config.js` 配置

### 4.4 动态安装

`easywebpack` 解决方案只内置了必须的几个常用 loader 和 plugin, 其他 loader (比如 less, stylus) 和 plugin (imagemini) 都是需要项目自己根据需要安装。
如果你自己搭建项目，遇到依赖缺失错误，除了手动 npm install 安装以外, 可以使用 `easy install` 命令，安装所有缺失的依赖，默认是 `npm` 方式

```bash
easy install
```

通过 `mode` 参数指定 `cnpm` 方式安装依赖(前提是你全局安装了cnpm)

```bash
easy install --mode cnpm
```

### 4.5 清除缓存

```bash
easy clean
```

### 4.6 打开缓存目录

```bash
easy open
```

### 4.7 杀进程(3.6.0)

```bash
easy kill 7001
easy kill 7001,9000,9001
```

### 4.8 构建大小分析(3.6.0)

通过 `-s` 参数启动构建大小分析工具, 支持 `analyzer`(webpack-bundle-analyzer)  和 `stats`(stats-webpack-plugin) ,  默认用 `analyzer`插件。

```bash
easy build -s 
```

使用 `stats`(stats-webpack-plugin) 构建大小分析工具

```bash
easy build -s stats
```

### 4.9 构建速度分析

使用插件 `speed-measure-webpack-plugin` 进行构建速度分析，统计各 loader 和 plugin 运行耗时

```bash
easy build --speed
```

### 4.10 启动本地静态 Web HTTP 服务

使用插件 `node-http-server` 进行本地目录编译访问，自动寻找 HTML 文件

- 默认当前目录

```bash
easy server
```

- 指定端口和目录

```bash
easy server -p 8888 -r dist
```

### 4.11 打印配置

```bash
easy print -h
```

  Usage: print [env] [options]

    print webpack config, support print by env or config node key


  Options:

    -k, --key [name]  print webpack config info by config key name, example: [module/module.rules/plugins] and so on
    -h, --help        output usage information

- easy print -k module

- easy print dev -k entry

- easy print test -k module.rules

- easy print prod -k module.rules[0]

- easy print -k plugins

- easy print -k plugins[0]

- easy print -k output

- easy print -k resolve

默认读取项目根目录下的 `webpack.config.js` 配置

## 五. License

[MIT](LICENSE)

说明: npm 模板下载参考 [egg-init](https://github.com/eggjs/egg-init) 脚手架实现.
