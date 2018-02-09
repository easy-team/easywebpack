<a name="3.6.6"></a>
## [3.6.6](https://github.com/hubcarl/easywebpack/compare/3.6.3...3.6.6) (2018-02-09)


### Bug Fixes

* easy build dll --size ([be5053f](https://github.com/hubcarl/easywebpack/commit/be5053f))


<a name="3.6.5"></a>
## [3.6.5](https://github.com/hubcarl/easywebpack/compare/3.6.3...3.6.5) (2018-02-03)


### Features

* support config.template for html ([1da9c36](https://github.com/hubcarl/easywebpack/commit/1da9c36))



<a name="3.6.4"></a>
## [3.6.4](https://github.com/hubcarl/easywebpack/compare/3.6.3...3.6.4) (2018-01-25)


### Features

* support config.template for html ([1da9c36](https://github.com/hubcarl/easywebpack/commit/1da9c36))



<a name="3.6.3"></a>
## [3.6.3](https://github.com/hubcarl/easywebpack/compare/3.6.2...3.6.3) (2018-01-17)


### Bug Fixes

* default config merge repeat ([79939ae](https://github.com/hubcarl/easywebpack/commit/79939ae))



<a name="3.6.2"></a>
## [3.6.2](https://github.com/hubcarl/easywebpack/compare/3.5.18...3.6.2) (2018-01-17)


### Features

* add getWebWebpackConfig and getNodeWebpackConfig method ([bfd33d6](https://github.com/hubcarl/easywebpack/commit/bfd33d6))
* auto set typescript configFile ([349a4af](https://github.com/hubcarl/easywebpack/commit/349a4af))
* use typescript, auto add resolve.extendsions: .ts ([8139010](https://github.com/hubcarl/easywebpack/commit/8139010))


3.6.0 / 2018-01-16
==================

  * feat: add getWebWebpackConfig and getNodeWebpackConfig method ([bfd33d6](https://github.com/hubcarl/easywebpack/commit/bfd33d6))
  * feat: add typescript support ([2692213](https://github.com/hubcarl/easywebpack/commit/2692213))
  * fix: support postcss loader options config and auto set sourceMap:true when devtool set ([271f4cc](https://github.com/hubcarl/easywebpack/commit/271f4cc))
  * feat: use typescript, auto add resolve.extendsions: .ts ([8139010](https://github.com/hubcarl/easywebpack/commit/8139010))


3.5.18 / 2018-01-15
===================

  * fix:https://github.com/hubcarl/egg-vue-webpack-boilerplate/issues/51

3.5.13 / 2018-01-06
===================

  * test: remove test log
  * fix: dll entry add twice
  * fix: cdn dynamicDir test

3.5.9 / 2018-01-04
==================

  * fix: publicPath override for cdn url
  * eslint:remove config
  * fix: plugins is undefined
  * doc: update image name

3.5.8 / 2018-01-04
==================

  * fix: plugins is undefined
  * doc: update image name

3.5.7 / 2018-01-04
==================

  * feat: auto open manifest when use dll
  * fix: module undefined when typescript module dev hot add or delete
  * doc:update readme to ZN

3.5.6 / 2017-12-27
==================

  * fix: dynamic install pkg: config.install

3.5.5 / 2017-12-26
==================

  * fix:dev mode not get dll config

3.5.4 / 2017-12-26
==================

  * feat: dll auto checkout and fix dll path error
  * feat: support auto check dll config modify, rebuild dll
  * style:format eslint code

3.5.2 / 2017-12-25
==================

  * fix:loader default is disable, custom set config auto open

3.5.1 / 2017-12-22
==================

  * fix: modify default publicPath, dll publicPath not update
  * doc:History version

3.5.0 / 2017-12-21
=======================
  - entry include 支持正则配置
  - 支持 webpack dll 配置和自动化构建， 无需手动先构建dll， 然后再构建页面
  - 简化 commonsChunk lib 配置， 无需在 onClient 调用 addEntry 设置
  - plugins 和 loaders 增加数组的配置的兼容，也就是支持原生配置
  - 去掉options节点配置，改为 webpack.config.js 支持原生 Webpack 配置
  - 支持多进程 Webpack 编译, 结合dll功能编译速度显著提示，初步测试编译时间减少2/3, 第三方组件越多和页面越多，越明显
  - manifest和buildfie合并为新的manifest， 无需 manifest 和 manifestDeps 兼容配置， 同时去掉 buildfie 配置， 
  - 默认禁用 npm start 启动检查 webpack loader 和 plugin 是否安装的功能， 提高编译速度。
  - stylus 和 less loader 默认有开启改为禁用， 减少不必要的安装
  - 新增内置插件 webpack-bundle-analyzer 和 stats-webpack-plugin
  - node externals 改为 webpack-node-externals 插件实现
  - 压缩插件由webpack内置改为 uglifyjs-webpack-plugin 独立插件, 从而支持多进程编译
  - 解决 NODE_ENV=production 导致动态安装 npm 依赖失败
  - 修复 easywebpack 配置合并覆盖问题

3.4.1 / 2017-12-01
==================

  * fix: dynamic install dev npm module imagemin-webpack-plugin  faild when NODE_EVN=production

3.4.0 / 2017-11-30
==================

  * fix: when install npm module ,show detail error info
  * feat: support webpack-bundle-analyzer and stats-webpack-plugin

3.3.9 / 2017-11-29
==================

  * fix: import css in js not resolve
  * doc:simpe use doc
  * docs:simple doc
  * Update README.md
  * docs:image path doc to docs

3.3.8 / 2017-11-26
==================

  * feat: support html template from entry same name config

3.3.6 / 2017-11-24
==================

  * fix: entry hot config concat error

3.3.5 / 2017-11-24
==================

  * feat:support extract css hot reload

3.3.4 / 2017-11-23
==================

  * fix: devtool env valid error

3.3.3 / 2017-11-23
==================

  * fix: server not need source map, will improve build speed

3.3.2 / 2017-11-13
==================

  * fix:options.entry not defined error
  * fix:entry valuve is array, parse entry error
  * fix: CommonsChunkPlugin vendor hash change
  * publish:3.3.1

3.3.1 / 2017-11-10
==================

  * feat:open hmr reload default
  * test:完善test‘

3.3.0 / 2017-11-09
==================

  * feat: support  manifest build info deps

3.2.7 / 2017-10-31
==================

  * fix:buildhtml not set, the build file path error
  * Update README.md
  * Update README.md
  * doc: add use doc link

3.2.6 / 2017-09-27
==================

  fix:loader.use is function merge bug for vue options merge


3.2.5 / 2017-09-27
==================

  perf: npm-install-webpack-plugin default enable affect npm start command start speed, default to disable

3.2.4 / 2017-09-22
==================

  feat: default not exclude node_modules css


3.2.3 / 2017-09-21
==================

  * fix: server side render, egg local dev mode , proxy static resource proxy to 7001 address

3.2.2 / 2017-09-21
==================

  * fix: windows path for manifest

3.2.1 / 2017-09-20
==================

  * fix: windows isAbsolute proplem, use path.isAbsolute,not path.posix.isAbsolute

3.2.0 / 2017-09-20
==================

  * fix:window npm dynamic install peer not match
  * fix: conflict from webpack3
  * doc:image weex error
  * 3.1.3
  * fix: when setEnv, default config not effective
  * fix:loader boolean config not effective

3.2.0 / 2017-09-20
==================

  * feat:npm dynamic install npm module
  * fix:plugin args override
  * test:add unit test
  * deps:remove unused dependence

3.1.2 / 2017-09-14
==================

  * feat:build and method support option params

3.1.0 / 2017-09-13
==================

  * feat:support loader use override and options config

3.0.1 / 2017-09-12
==================

  * fix:isUse method null and refactor html config


3.0.0 / 2017-09-08
==================

  * fix: windows buildConfig path error
  * doc:feature
  * Release 3.0.0-rc3

3.0.0-rc3 / 2017-09-08
======================

  * feat:css module
  * feat: css module and css support impl and test

3.0.0-rc2 / 2017-09-07
======================

  * fix:react css extract

3.0.0-rc1 / 2017-09-06
======================

  * feat:webpack3 rc1
  * refactor:loader load
  * feat:webpack3 doing
  * feat:webpack3 loader and plugin refactor

1.0.4 / 2017-08-21
==================

  * deps:add stylus deps

1.0.2 / 2017-08-17
==================

  * fix:define update, need dynamic get

1.0.1 / 2017-08-17
==================

  * fix: keep entry file hash stable


1.0.0 / 2017-08-09
==================

  * publish:1.0.0

0.9.8 / 2017-08-09
==================

  * feat:sass indentedSyntax and stylus

0.9.7 / 2017-08-07
==================

  * fix:html not config error

0.9.6 / 2017-08-07
==================

  * fix:less sass style build error
  * test: add cov image
  * test:ci codecov
  * test:cov
  * test: add test for 1.0.0
  * fix:load replace
  * doc:update readme

0.9.4 / 2017-08-02
==================

  * fix:auto html entry
  * perf: cache load modules

0.9.3 / 2017-07-31
==================

  * deps:upgrade all npm package
  * fix:auto entry loader path error
  * feat:auto entry loader
  * doc:update guild link

0.8.1 / 2017-07-25
==================

  * fix:weex html
  * feat:support cli
  * fix:hot port mapping egg-webpack

0.7.2 / 2017-07-18
==================

  * fix:dev mode port
  * refactor: default env config
  * feat: static resource proxy

0.7.0 / 2017-07-18
==================

  * refactor: default env config
  * feat: static resource proxy

0.6.5 / 2017-07-14
==================

  * feat: static resource proxy

0.6.4 / 2017-07-13
==================

  * fix:autoprefix

0.6.3 / 2017-07-12
==================

  * refactor:support config
  * feat:add build path in buildConfig
  * feat:support local test

0.6.1 / 2017-07-11
==================

  * feat:support local test

0.6.0 / 2017-07-11
==================

  * refacotr:support cli
  * feat:cli
  * refactor:support html and pack

0.5.15 / 2017-07-07
===================

  * feat:chunk name

0.5.14 / 2017-07-05
===================

  * fix:css path error

0.5.13 / 2017-07-04
===================

  * fix:server build image path error and support cdn

0.5.10 / 2017-06-28
===================

  * fix:setAlias auto baseDir error

0.5.9 / 2017-06-28
==================

  * fix:0.5.8 entry path error

0.5.8 / 2017-06-28
==================

  * feat:support entry and alias  abspath set

0.5.7 / 2017-06-27
==================

  * feat:image crompress
  * publish:0.5.6
  * fix:webpack build server port
  * Update README.md

0.5.5 / 2017-06-25
==================

  * fix:weex sass not effictive
  * feat:support weex

0.5.1 / 2017-06-21
==================

  * feat:support weex
  * refactor:seperate weboack build

0.4.1 / 2017-06-19
==================

  * feat:support manifest and buildconfig can config
  * feat:support html plugin

0.4.0 / 2017-06-15
==================

  * feat:webpack build server

0.3.2 / 2017-06-09
==================

  * fix:hash change,filname not change

0.3.1 / 2017-06-09
==================

  * feat:support use chunk yes or no

0.2.2 / 2017-06-07
==================

  * fix:support manifest path custom
  * refactor:addLoader and addPlugin
  * refacotr:loader and plugin

0.1.1 / 2017-05-12
==================

  * feat:support css hot reload


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*