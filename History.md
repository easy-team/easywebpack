
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
