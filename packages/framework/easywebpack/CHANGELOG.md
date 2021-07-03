# [5.1.0-beta.2](https://github.com/easy-team/easywebpack/compare/4.12.8...5.1.0-beta.2) (2021-07-03)


### Bug Fixes

* adpater vue-loader for vue2,vue3 ([c9a1cd5](https://github.com/easy-team/easywebpack/commit/c9a1cd5a803358896ba3fe15a8fbdc4a5d575ce5))
* support vue 3 ([ab31ccc](https://github.com/easy-team/easywebpack/commit/ab31cccace87d6c577d701858e4b6bae1ff6e49b))
* use terser-webpack-plugin and css-minimizer-webpack-plugin ([e8034de](https://github.com/easy-team/easywebpack/commit/e8034dee5ee490aef02aa3bda92022ccd8c04d21))
* webpack resolve module repeat ([be6e9b9](https://github.com/easy-team/easywebpack/commit/be6e9b998714ec409736e4da9c6eba2b9fde846a))


### Features

* setting vue3 webpack build alias ([a971d7c](https://github.com/easy-team/easywebpack/commit/a971d7cbdc19ba65b9875c42d8a30e9730af3efb))
* vue 3 support ([a820e02](https://github.com/easy-team/easywebpack/commit/a820e02a2db378fd388074a186d47620327c0cec))



# [5.0.0](https://github.com/easy-team/easywebpack/compare/5.0.0-beta.2...5.0.0) (2020-10-16)


### Features

* not need set css hot for webpack 5 ([facaff6](https://github.com/easy-team/easywebpack/commit/facaff6d99fcf8671c8d500b2f9ef311cfa260dc))
* plugin env override support ([2d7ceb4](https://github.com/easy-team/easywebpack/commit/2d7ceb49785e629c63eb9c9e64b9c66bf83a8e9b))
* webpack 5 ([dc18547](https://github.com/easy-team/easywebpack/commit/dc185478a2f93aa348edef7abd461fd9695b2ecb))


## [4.11.7](https://github.com/easy-team/easywebpack/compare/4.11.6...4.11.7) (2019-07-17)


### Bug Fixes

* add renderMode for entry template loader ([bcfe8c5](https://github.com/easy-team/easywebpack/commit/bcfe8c500de8de3165528ea5d93391fd0438d7e7))



## [4.11.6](https://github.com/easy-team/easywebpack/compare/4.11.5...4.11.6) (2019-06-18)


### Bug Fixes

* https://github.com/easy-team/easywebpack/issues/56 ([5ad7d23](https://github.com/easy-team/easywebpack/commit/5ad7d238d676ece8791cda53f83206241364d74a))



## [4.11.5](https://github.com/easy-team/easywebpack/compare/4.11.4...4.11.5) (2019-03-13)


### Bug Fixes

* common css  miniChunks 2 ([92af3d9](https://github.com/easy-team/easywebpack/commit/92af3d92e74249cd6d1117e47ceb77498b8138a1))



## [4.11.4](https://github.com/easy-team/easywebpack/compare/4.11.3...4.11.4) (2019-01-10)


### Bug Fixes

* manifest key word error ([29ac2de](https://github.com/easy-team/easywebpack/commit/29ac2de9024ab396548d18fd2b0ac0f140ff4f13))



## [4.11.3](https://github.com/easy-team/easywebpack/compare/4.11.2...4.11.3) (2018-11-22)


### Bug Fixes

* devtool and sourceMap, dev: eval ([446bdbb](https://github.com/easy-team/easywebpack/commit/446bdbb4260eaa95848023b0a62f15c2dd47dfe5))
* dll missing uglifyJs config ([34a5b4a](https://github.com/easy-team/easywebpack/commit/34a5b4ac428ad4306f72ebc680f8cea3b1e0686a))
* node build for es6 ([6acfaf8](https://github.com/easy-team/easywebpack/commit/6acfaf858c6019dd644dec22e5c09d995fe38371))
* uglifyJs valid by getConfigPlugin ([9a0a772](https://github.com/easy-team/easywebpack/commit/9a0a772580a5f5ca60ddfac26935c41245317b1f))



## [4.11.2](https://github.com/easy-team/easywebpack/compare/4.11.1...4.11.2) (2018-11-22)


### Bug Fixes

* minimize not set ([068003f](https://github.com/easy-team/easywebpack/commit/068003fb575728e2136e0c8c19cfdbcbec25c88d))
* uglifyJs merge with object and array mode ([95e2e71](https://github.com/easy-team/easywebpack/commit/95e2e71c837f66148b35003c2049be305b6e34e2))



## [4.11.1](https://github.com/easy-team/easywebpack/compare/4.11.0...4.11.1) (2018-11-21)


### Bug Fixes

* hot path error ([9690d2b](https://github.com/easy-team/easywebpack/commit/9690d2b3d11756fa621c1bf7fcc331466bb52878))
* https://github.com/TypeStrong/ts-loader/pull/7820 ([b22ee53](https://github.com/easy-team/easywebpack/commit/b22ee53f5e47bb5775e23d9554bb435b6c0c9379))
* loader options extend and options merge ([b19f745](https://github.com/easy-team/easywebpack/commit/b19f74566d43c1e71684812d64476ae915d192cc))
* ScriptExtHtmlWebpackPlugin not use dll ([32c5ca9](https://github.com/easy-team/easywebpack/commit/32c5ca99811e914f4a611299df0253c0493244ce))
* ssr default dir ([caf3f04](https://github.com/easy-team/easywebpack/commit/caf3f044e64572a36a1186f65fae0b8fd7048549))


### Features

* 4.11.0-next ([d9b1a4f](https://github.com/easy-team/easywebpack/commit/d9b1a4f268f1e460f7b0a3c152ee8061c0fa76b8))
* loader.options support ([61886d5](https://github.com/easy-team/easywebpack/commit/61886d59191c68a0ba489c94fb2c23b23ed39031))
* support module.rules config ([e37d181](https://github.com/easy-team/easywebpack/commit/e37d1815d8a7748a15ef8024f6f38147ba45e8bb))
* support module.rules config ([3226ede](https://github.com/easy-team/easywebpack/commit/3226ede8f41883a580beeebb950fb5d8723caa50))



## [4.10.2](https://github.com/easy-team/easywebpack/compare/4.10.1...4.10.2) (2018-11-20)


### Bug Fixes

* Uncaught ReferenceError: global is not defined ([d7d8454](https://github.com/easy-team/easywebpack/commit/d7d8454ef13688fc19edcf095438b5a0faff36b3))



## [4.10.1](https://github.com/easy-team/easywebpack/compare/4.10.0...4.10.1) (2018-11-19)


### Bug Fixes

* add missing deps uglifyjs-webpack-plugin ([4f85d2d](https://github.com/easy-team/easywebpack/commit/4f85d2dbac8aa5db20d2bd1fafbcb68141082685))



# [4.10.0](https://github.com/easy-team/easywebpack/compare/4.9.6...4.10.0) (2018-11-15)


### Bug Fixes

* add webpack plugin filter: webpack-filter-warnings-plugin https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250 ([b19ee30](https://github.com/easy-team/easywebpack/commit/b19ee30d57589995d20dc2a27f6826a5a8ac4ef6))
* split for lib ([06eed40](https://github.com/easy-team/easywebpack/commit/06eed4064d6b2e26a807969854ebd8b591fb47b9))
* webpack-tool proxy ([fa11a07](https://github.com/easy-team/easywebpack/commit/fa11a0767c0b95c0195c5eb76e8007fdf5657abe))


### Features

* disable node polyfill ([1c4e556](https://github.com/easy-team/easywebpack/commit/1c4e556e788e8b15b6d6392f9f9b4bcfbbd316a1))
* namedModules and namedChunks default set true ([b5bc5d3](https://github.com/easy-team/easywebpack/commit/b5bc5d3edcac5d10e871c941111bf331f016608e))
* not need set entry for lib ([177ed1a](https://github.com/easy-team/easywebpack/commit/177ed1ae00be529b43bc83c5bee87380525c33ec))
* support uglifyJs config for optimization ([b968cdd](https://github.com/easy-team/easywebpack/commit/b968cdd1ae0b99f99320dff6fc8c50565e8f181a))
* use optimization config ([6dc571b](https://github.com/easy-team/easywebpack/commit/6dc571bda3a8e596b4635bcb37cf111e64dcc557))



## [4.9.6](https://github.com/easy-team/easywebpack/compare/4.9.5...4.9.6) (2018-11-08)


### Bug Fixes

* ts cache and auto check egg ([150d925](https://github.com/easy-team/easywebpack/commit/150d925d582690953a7cb9e7741527028d6606cb))
* typescript compile react mode ([2d9ce36](https://github.com/easy-team/easywebpack/commit/2d9ce36747f28550dbe4a08ecd11dda7ee870b80))



## [4.9.5](https://github.com/easy-team/easywebpack/compare/4.9.4...4.9.5) (2018-11-07)


### Bug Fixes

* no babelrc options merge error ([e647ca6](https://github.com/easy-team/easywebpack/commit/e647ca6138055d1d754c74bdac628195e04a4976))



## [4.9.4](https://github.com/easy-team/easywebpack/compare/4.9.3...4.9.4) (2018-11-07)


### Bug Fixes

* babel7 not support forceEnv, use envName replace ([5e6f49d](https://github.com/easy-team/easywebpack/commit/5e6f49df20e8446a8b95208dbdba9e41ad5ed753))



## [4.9.3](https://github.com/easy-team/easywebpack/compare/4.9.2...4.9.3) (2018-11-01)


### Bug Fixes

* support babel-7 and babel-loader-8 ([8228f23](https://github.com/easy-team/easywebpack/commit/8228f23da2ca4e08eb2605d8c6e0856e1a411837))



## [4.9.2](https://github.com/easy-team/easywebpack/compare/4.9.1...4.9.2) (2018-11-01)


### Bug Fixes

* loader merge invalid options ([71399c5](https://github.com/easy-team/easywebpack/commit/71399c5bbaa02ae609d35c64c4e6ed4b540ecad9))



## [4.9.1](https://github.com/easy-team/easywebpack/compare/4.9.0...4.9.1) (2018-11-01)


### Bug Fixes

* client render entry error for babel-loader path ([c9c15fd](https://github.com/easy-team/easywebpack/commit/c9c15fdc55c170f137fb56be6d378309c21f2a0d))



# [4.9.0](https://github.com/easy-team/easywebpack/compare/4.8.5...4.9.0) (2018-11-01)


### Bug Fixes

* default babelrc ([ec40b67](https://github.com/easy-team/easywebpack/commit/ec40b67935b3910b75f886e7de578b1659d0029b))
* loader no options merge ([c3a7923](https://github.com/easy-team/easywebpack/commit/c3a79236273e23f9dee6fe4565c4356d8bbd4380))
* mutil compiler babel env invalid ([5dfc4ed](https://github.com/easy-team/easywebpack/commit/5dfc4ed8a6fcd441ecdc540ad7c18773fe03e50d))
* vue entry file babel compile error ([eeeaeb7](https://github.com/easy-team/easywebpack/commit/eeeaeb7c13dccd2d909aa6d493a151035178e8d1))


### Features

* add webpack config  customize hook ([d04abf0](https://github.com/easy-team/easywebpack/commit/d04abf059aaede9c1e370577bc6a11d1b4036800))
* babelrc use js file config ([1bce900](https://github.com/easy-team/easywebpack/commit/1bce900136fe51a19e45083ac845971e04892dc2))
* default open compile.cache and compile.thread ([ff3a663](https://github.com/easy-team/easywebpack/commit/ff3a6637bb1e01ef999f10927e5135c5f2361acd))
* dev mode node.console: true ([1e4fa56](https://github.com/easy-team/easywebpack/commit/1e4fa566844fbffb26e460a5c4623fbc066200a5))
* eslint default disabled ([c51f42c](https://github.com/easy-team/easywebpack/commit/c51f42c5bd8fb01a8391e22ab0461cbe3d67ff3e))
* support babel default config ([df9bb78](https://github.com/easy-team/easywebpack/commit/df9bb78ef90a59c71785fc72f81854d4a167ac10))



## [4.8.5](https://github.com/easy-team/easywebpack/compare/4.8.4...4.8.5) (2018-10-15)


### Bug Fixes

* config merge ([b76aca6](https://github.com/easy-team/easywebpack/commit/b76aca63d4226faa1fc1f0d5285b35b4245f4d0e))
* plugin array args merge ([78af03e](https://github.com/easy-team/easywebpack/commit/78af03ebcebcfc36dd596ee5bb0f3093c50d0f9a))
* plugin config is Array ([04c36d8](https://github.com/easy-team/easywebpack/commit/04c36d85f8d657f3255bce65035b9117bd52f984))
* webpack plugin only apply method ([b1e7cb2](https://github.com/easy-team/easywebpack/commit/b1e7cb26ef8fa31a77e73c82273a58e08835f8bf))


### Features

* auto set target by deps and node_modules ([3c0962a](https://github.com/easy-team/easywebpack/commit/3c0962af3ea350684cb6234efa84b06146dd2c51))
* support plugins array config ([7257d9b](https://github.com/easy-team/easywebpack/commit/7257d9b903f25af62f2d5efecfcdae640ed3f1fd))



## [4.8.4](https://github.com/easy-team/easywebpack/compare/4.8.3...4.8.4) (2018-10-12)


### Bug Fixes

* fix window path seperate // ([461f599](https://github.com/easy-team/easywebpack/commit/461f59977e84d11c890c4436503f8dd01270a98b))


### Features

* return init zero config ([bb35f38](https://github.com/easy-team/easywebpack/commit/bb35f38d74b268e5f6ac262ff7cdb83998515908))
* set html default template and doc ([d13d0a7](https://github.com/easy-team/easywebpack/commit/d13d0a73bd8b0e8d20a3f857165c12e45cc6d4b4))



## [4.8.3](https://github.com/easy-team/easywebpack/compare/4.8.2...4.8.3) (2018-10-10)


### Bug Fixes

* entry filter invalid on window ([fc0d8c4](https://github.com/easy-team/easywebpack/commit/fc0d8c40d632eaa6745c86060fd10972b9853e67))



## [4.8.2](https://github.com/easy-team/easywebpack/compare/4.8.0-rc.6...4.8.2) (2018-10-10)


### Bug Fixes

* isEgg valid params ([160a7c3](https://github.com/easy-team/easywebpack/commit/160a7c34bbd64836cd2f5926e1b220b59cc4d00b))
* windows entryName path error, use path.posix ([dcbacd4](https://github.com/easy-team/easywebpack/commit/dcbacd4f604521e46cf35cf4bf2534afde26497d))



## [4.7.1](https://github.com/easy-team/easywebpack/compare/4.7.0...4.7.1) (2018-09-19)


### Bug Fixes

* css not mini-> minicss: optimize-css-assets-webpack-plugin ([ebe38f9](https://github.com/easy-team/easywebpack/commit/ebe38f9502710e62a60446fefca154215945f5da))



# [4.8.0-rc.6](https://github.com/easy-team/easywebpack/compare/4.7.1...4.8.0-rc.6) (2018-09-30)


### Bug Fixes

* auto set entry ([adf55b3](https://github.com/easy-team/easywebpack/commit/adf55b376bcdef3bf2e45dfdd2edab2d8e03b6b7))
* cli and easy config merge ([e8d1a97](https://github.com/easy-team/easywebpack/commit/e8d1a9719b91e4f1e06c1838ace2be4a51a060b8))
* cli devtool set ([9fdfdc8](https://github.com/easy-team/easywebpack/commit/9fdfdc8db4d729943ebbacf0f462f1f5af557ed0))
* default entry set ([32d037b](https://github.com/easy-team/easywebpack/commit/32d037b48c5db854f1e4b4be1ebf3cd5795f788c))
* dll buildPath error ([8133053](https://github.com/easy-team/easywebpack/commit/8133053f9887721ecd32822bba996892a1f3b792))
* dll check update ([f34fa78](https://github.com/easy-team/easywebpack/commit/f34fa7828cf13daf6931659892a4e0cb5446e76a))
* framework auto set ([8dc2318](https://github.com/easy-team/easywebpack/commit/8dc231841c613e875a267101f9f7983727165641))
* framework auto set ([ab3294d](https://github.com/easy-team/easywebpack/commit/ab3294d2f42facc24a872e04071c3e9aa988e5b0))
* get dll webpack config from cli ([db0f782](https://github.com/easy-team/easywebpack/commit/db0f782bfd47254ab7f4db8b23fcd40836ba8432))
* glob.sync search slow when no set search root ([4ab77f6](https://github.com/easy-team/easywebpack/commit/4ab77f642411cd6635731f08b4d9a23c1e77c79d))
* not postcss.config.js error ([93e09c9](https://github.com/easy-team/easywebpack/commit/93e09c93ccdc5d872eb5adfe554f7597b2a96f84))
* zero config entry set ([2d532bb](https://github.com/easy-team/easywebpack/commit/2d532bbd4d656e001f99336fe6a64eb55a01ce0a))


### Features

* 4.7.0-rc.1 ([12f858f](https://github.com/easy-team/easywebpack/commit/12f858f7f2738c0007c30e8b5a9dbdd4da979635))
* add babel plugin dependencies, project does not need to config dependencies ([215a524](https://github.com/easy-team/easywebpack/commit/215a524f56d53261d211e10b0323fadf330bb2b7))
* add case-sensitive-paths-webpack-plugin support ([65e6c86](https://github.com/easy-team/easywebpack/commit/65e6c86aecd0420fad06c235a281543179a57bbb))
* add postcss default config ([302302f](https://github.com/easy-team/easywebpack/commit/302302f61438b2a472c47a208e6f933fe9c64707))
* auto check egg environment, not config.egg ([525b418](https://github.com/easy-team/easywebpack/commit/525b41854b433d97ad535d3704e31ff261f8b031))
* glob entry support and entry template support ([f558a0b](https://github.com/easy-team/easywebpack/commit/f558a0b190a75930a720a21b51a763aa7a17f413))
* modify publicPath and buildPath value ([e11119e](https://github.com/easy-team/easywebpack/commit/e11119e4160c9c409f06b8a179c3753d9f173bdd))
* support dynamic port ([2a659f3](https://github.com/easy-team/easywebpack/commit/2a659f3442aa80d077eecf974d5e4441393e033e))
* support glob ingore config ([d1ddb9c](https://github.com/easy-team/easywebpack/commit/d1ddb9c73c7914ad94b774494230cc296c873e19))
* zero config init ([e13712c](https://github.com/easy-team/easywebpack/commit/e13712c2ccc2a2d91ab7e6051d1690303ff0a7cc))


### Performance Improvements

* performance config merge speed ([60ed725](https://github.com/easy-team/easywebpack/commit/60ed725ba6184afcc0ca27077fbbf0a7b15b108b))



## [4.7.1](https://github.com/easy-team/easywebpack/compare/4.7.0...4.7.1) (2018-09-19)


### Bug Fixes

* css not mini-> minicss: optimize-css-assets-webpack-plugin ([ebe38f9](https://github.com/easy-team/easywebpack/commit/ebe38f9502710e62a60446fefca154215945f5da))



# [4.7.0](https://github.com/easy-team/easywebpack/compare/4.6.0...4.7.0) (2018-09-05)


### Bug Fixes

* css hot ([13fc036](https://github.com/easy-team/easywebpack/commit/13fc0364ed82e54618e74bb05ddb2e4a58c0af9e))


### Features

* support BABEL_ENV node and web single config ([61df5fb](https://github.com/easy-team/easywebpack/commit/61df5fbe2922e74010055dac0613b46655e1716e))



# [4.6.0](https://github.com/easy-team/easywebpack/compare/4.5.2...4.6.0) (2018-08-31)


### Features

* add clean-webpack-plugin config support ([ce50e67](https://github.com/easy-team/easywebpack/commit/ce50e672419f765d29cf1a95e5ec8797e558fc19))
* dev mode not use cdn config ([70bcae1](https://github.com/easy-team/easywebpack/commit/70bcae1005703658e05fed5e993bd5daf762fb78))
* 如果存在同名 html 模板文件, 全局 template 配置非必须 ([7ec20aa](https://github.com/easy-team/easywebpack/commit/7ec20aa29d1bd559f6a81946caa7cda5f3ed9206))



## [4.5.2](https://github.com/easy-team/easywebpack/compare/4.5.1...4.5.2) (2018-08-22)


### Bug Fixes

* support set manifest filepath and default outputPath ([d41de3f](https://github.com/easy-team/easywebpack/commit/d41de3fdb48635afc66c57cc034bad1c10d469e5))



## [4.5.1](https://github.com/easy-team/easywebpack/compare/4.5.0...4.5.1) (2018-08-21)


### Bug Fixes

* multiple process lead build slow, set default 2 ([a8f4d6e](https://github.com/easy-team/easywebpack/commit/a8f4d6e46a06ca89a76941fb7aecfdc6bf038f94))



# [4.5.0](https://github.com/easy-team/easywebpack/compare/4.4.6...4.5.0) (2018-06-29)


### Features

* extract-text-webpack-plugin to mini-css-extract-plugin ([54b6c54](https://github.com/easy-team/easywebpack/commit/54b6c548b29f08ce33289f6647fef9552ed3b1e1))



## [4.4.6](https://github.com/easy-team/easywebpack/compare/4.4.5...4.4.6) (2018-06-29)


### Bug Fixes

* test env use production, scan code ([f617f6e](https://github.com/easy-team/easywebpack/commit/f617f6e373140efcd09a8afbfedd4e4f2d789e31))



## [4.4.5](https://github.com/easy-team/easywebpack/compare/4.4.4...4.4.5) (2018-06-20)


### Bug Fixes

* dll support node key config ([b8d5010](https://github.com/easy-team/easywebpack/commit/b8d501049bb19f3452afab493f0a43ede4590cb9))



## [4.4.4](https://github.com/easy-team/easywebpack/compare/4.4.2...4.4.4) (2018-06-09)


### Bug Fixes

* set host, proxy false ([4e09a2c](https://github.com/easy-team/easywebpack/commit/4e09a2c349e09a1cb7660c3083aa2ca565fd59f7))
* 修复html-webpack无法查找entryTemplate ([815b33c](https://github.com/easy-team/easywebpack/commit/815b33c0f1ca333dee6d49ccdc211ab876a9b2ba))



## [4.4.2](https://github.com/easy-team/easywebpack/compare/4.4.1...4.4.2) (2018-05-31)


### Bug Fixes

* remove repeat cache config ([8e00d12](https://github.com/easy-team/easywebpack/commit/8e00d127782f21bfc2c661eaa8df796754384a71))



## [4.4.1](https://github.com/easy-team/easywebpack/compare/4.4.0...4.4.1) (2018-05-22)


### Bug Fixes

* add thread-loader ([a35a0d7](https://github.com/easy-team/easywebpack/commit/a35a0d74015e3022ad1807992fbd734300fdd3cf))
* build prod css not compressed ([7703b0b](https://github.com/easy-team/easywebpack/commit/7703b0b7cf1bb45c54a7cde9f2f873a75e0cc156))



# [4.4.0](https://github.com/easy-team/easywebpack/compare/4.2.4...4.4.0) (2018-04-26)


### Bug Fixes

* array merge repeat ([abbf382](https://github.com/easy-team/easywebpack/commit/abbf382d50b1128d22252592244816381ba5e1c3))


### Features

* auto set sourceMap when devtool set ([708cce8](https://github.com/easy-team/easywebpack/commit/708cce86ca410f74479e41a34205fa250a8f4d9b))



## [4.2.4](https://github.com/easy-team/easywebpack/compare/4.2.3...4.2.4) (2018-03-30)


### Bug Fixes

* eval use production, jsbundle file size large, limit use eval in production ([4a32c4f](https://github.com/easy-team/easywebpack/commit/4a32c4f13b02164e72184d80b7c75d00226cf4f4))


### Features

* support thread-loader and cache-loader for babel and ts ([ae5d444](https://github.com/easy-team/easywebpack/commit/ae5d4441edf72e70fde732eb40f2c778b4b65356))



## [4.2.3](https://github.com/easy-team/easywebpack/compare/4.2.2...4.2.3) (2018-03-30)


### Bug Fixes

* hot css ([2380cf4](https://github.com/easy-team/easywebpack/commit/2380cf4695c793ffd2e21abebe4f68ba3c3c4982))



## [4.2.2](https://github.com/easy-team/easywebpack/compare/4.2.1...4.2.2) (2018-03-29)


### Bug Fixes

* stats port ([ede98df](https://github.com/easy-team/easywebpack/commit/ede98df0e9275d7de45656ca557dd1102d627c77))



## [4.2.1](https://github.com/easy-team/easywebpack/compare/4.2.0...4.2.1) (2018-03-29)


### Bug Fixes

* loader options merge label match ([e005ccf](https://github.com/easy-team/easywebpack/commit/e005ccfdf84f58d27bc1d5c35d46f8922967d09c))



# [4.2.0](https://github.com/easy-team/easywebpack/compare/4.1.3...4.2.0) (2018-03-29)



## [4.1.3](https://github.com/easy-team/easywebpack/compare/4.1.2...4.1.3) (2018-03-27)


### Bug Fixes

* ts-loader exclude array to object for override ([647d963](https://github.com/easy-team/easywebpack/commit/647d963ec5b1d739fcdc4827f77172bab88e9747))



## [4.1.2](https://github.com/easy-team/easywebpack/compare/4.1.1...4.1.2) (2018-03-22)


### Bug Fixes

* loader options merge ([69e14f2](https://github.com/easy-team/easywebpack/commit/69e14f28d84f7583fcb9c2400bd353ed6327ad1e))



## [4.1.1](https://github.com/easy-team/easywebpack/compare/4.1.0...4.1.1) (2018-03-20)


### Bug Fixes

* client and server cache dir separation ([856f7e0](https://github.com/easy-team/easywebpack/commit/856f7e08c1eee292b555ea50329c26485ee88b53))



# [4.1.0](https://github.com/easy-team/easywebpack/compare/4.0.7...4.1.0) (2018-03-20)


### Features

* mp4|webm|ogg|mp3|wav|flac|aac for url-loader ([76a597a](https://github.com/easy-team/easywebpack/commit/76a597a22cf1c59d26c42e1866b3ca97a2f35e98))
* support babel cache and typescript cache, default true ([f3db2cc](https://github.com/easy-team/easywebpack/commit/f3db2cc00d3c8d98ac1511020cdd138ee4ba70a0))



## [4.0.7](https://github.com/easy-team/easywebpack/compare/4.0.6...4.0.7) (2018-03-19)


### Bug Fixes

* loader options extend config ([a6df7b0](https://github.com/easy-team/easywebpack/commit/a6df7b0ca7307d611e0d3d54ccca5ce8a6eeaeb4))



## [4.0.6](https://github.com/easy-team/easywebpack/compare/4.0.5...4.0.6) (2018-03-19)


### Bug Fixes

* dll not support typescript and postcss-loader not invalid options config ([a2ba0ee](https://github.com/easy-team/easywebpack/commit/a2ba0ee996838740b6ad7a781af22427df4e4962))



## [4.0.5](https://github.com/easy-team/easywebpack/compare/4.0.3...4.0.5) (2018-03-15)


### Bug Fixes

* less loader not include ([9d42768](https://github.com/easy-team/easywebpack/commit/9d42768c4f1927f35e2b280da8071035e406f8dc))
* set prefix support with easywebpack 3 ([ffb14a6](https://github.com/easy-team/easywebpack/commit/ffb14a66923f1ec76f01eb35a8d27efd1cd387fc))



## [4.0.3](https://github.com/easy-team/easywebpack/compare/4.0.2...4.0.3) (2018-03-13)


### Bug Fixes

* dynamic load componet extract css not require, must use allChunk ([6255a79](https://github.com/easy-team/easywebpack/commit/6255a7934a1097c4094d5c1edb04c605eeaff87c))
* npm cnpm warn ([c6f038b](https://github.com/easy-team/easywebpack/commit/c6f038be1cd6d3025de8e307c30df8c453eda2b9))



## [4.0.2](https://github.com/easy-team/easywebpack/compare/4.0.1...4.0.2) (2018-03-12)



## [4.0.1](https://github.com/easy-team/easywebpack/compare/4.0.0...4.0.1) (2018-03-09)


### Bug Fixes

* less loader not add preloaders ([6d373bc](https://github.com/easy-team/easywebpack/commit/6d373bcb78c2033f11f8fe5d0e0aebd9f4c1aba0))
* uglifyjs-webpack-plugin repeat and open cache ([256f679](https://github.com/easy-team/easywebpack/commit/256f679b4958c1fd27eb9b9780a119b09ecf4f6a))



# [4.0.0](https://github.com/easy-team/easywebpack/compare/3.7.1...4.0.0) (2018-03-07)


### Bug Fixes

* dll resolveLoader.module config for easywebpack in framework ([031672b](https://github.com/easy-team/easywebpack/commit/031672b1cd6061da81b14f647a3a78ea4fb3ded8))
* egg buildPath dir must be app/view ([8c7b3ef](https://github.com/easy-team/easywebpack/commit/8c7b3ef3560027d5da0ce4c181ba889095f01c77))
* egg config server path: app/view ([8ba0720](https://github.com/easy-team/easywebpack/commit/8ba072098fa4dfa8bbf40a58187d373962e6eac7))
* es6 to es5 ([6d8100f](https://github.com/easy-team/easywebpack/commit/6d8100fed26325327cf82bb50b5b2f071414d72f))
* proxy publicPath ([f988c1b](https://github.com/easy-team/easywebpack/commit/f988c1bc8305dacbb202373891bc2cb534481283))


### Features

* adjust error msg when plugin missing ([927e63a](https://github.com/easy-team/easywebpack/commit/927e63a2f141fd79dafed3c3e6be2bf074a15f38))
* commonsChunk for webpack4 ([21be7f9](https://github.com/easy-team/easywebpack/commit/21be7f9f676d4e688bbaeb0bb2eec25696b0b0d5))
* disable commonsChunk config and directoryName plugin ([277ebb4](https://github.com/easy-team/easywebpack/commit/277ebb491ea54af90178edb901cfb0fffb9f4073))
* use proxy, not need dev host ([95a348a](https://github.com/easy-team/easywebpack/commit/95a348a4f29465171fd1f856932d9c5dedc81122))



## [3.7.1](https://github.com/easy-team/easywebpack/compare/3.6.6...3.7.1) (2018-03-05)


### Bug Fixes

* easy dll stats from master ([bd45fa0](https://github.com/easy-team/easywebpack/commit/bd45fa056c8c83d8e9d975d16f8301ccb2526853))
* framework es6 to es5 ([9f5577b](https://github.com/easy-team/easywebpack/commit/9f5577b87e3354db03e5c9ec4adcb55a372fdd8a))


### Features

* service worker support ([967ee28](https://github.com/easy-team/easywebpack/commit/967ee28993c2f3a74bad6ea0c3a3abe111686358))



## [3.6.6](https://github.com/easy-team/easywebpack/compare/3.6.3...3.6.6) (2018-02-09)


### Bug Fixes

* easy build dll --size ([be5053f](https://github.com/easy-team/easywebpack/commit/be5053f2bc334f38e951ecf500fd480adf0b5a15))


### Features

* support config.template for html ([1da9c36](https://github.com/easy-team/easywebpack/commit/1da9c3639fd101880d07f498be8a6f6ea72422d2))



## [3.6.3](https://github.com/easy-team/easywebpack/compare/3.6.2...3.6.3) (2018-01-17)


### Bug Fixes

* default config merge repeat ([79939ae](https://github.com/easy-team/easywebpack/commit/79939aea40809a83051e12278d48c65b37bed5c0))



## [3.6.2](https://github.com/easy-team/easywebpack/compare/3.5.18...3.6.2) (2018-01-17)


### Features

* add getWebWebpackConfig and getNodeWebpackConfig method ([bfd33d6](https://github.com/easy-team/easywebpack/commit/bfd33d67c78da9a6fda6a030ddb1de2d419b0bf2))
* add typescript support ([2692213](https://github.com/easy-team/easywebpack/commit/269221396ebb1e7cf69d403a44fe2093f4e62708))
* auto set typescript configFile ([349a4af](https://github.com/easy-team/easywebpack/commit/349a4af63f6b46dfc844557aa4a2a191a818fa37))
* support postcss loader options config and auto set sourceMap:true when devtool set ([271f4cc](https://github.com/easy-team/easywebpack/commit/271f4cc85bfad15eb9f0d05ab6084074d68907f5))
* use typescript, auto add resolve.extendsions: .ts ([8139010](https://github.com/easy-team/easywebpack/commit/8139010c256f1785fef200217d7a13ec9dffeee1))



## [3.5.18](https://github.com/easy-team/easywebpack/compare/3.5.16...3.5.18) (2018-01-15)


### Bug Fixes

* entry not string ([3b1605d](https://github.com/easy-team/easywebpack/commit/3b1605da74fec2871bf73866a50faa98d75eb604))
* https://github.com/hubcarl/egg-vue-webpack-boilerplate/issues/51 ([307adca](https://github.com/easy-team/easywebpack/commit/307adca203f6f629f5903fee53bb0716ba2a0ae6))



## [3.5.16](https://github.com/easy-team/easywebpack/compare/3.5.9...3.5.16) (2018-01-15)


### Bug Fixes

* alias override default set ([88c854d](https://github.com/easy-team/easywebpack/commit/88c854dd76d75c778768adfd0c0f7b7bffd422cc))
* cdn dynamicDir test ([4054c58](https://github.com/easy-team/easywebpack/commit/4054c58272d7af4d185807692ad67231fd21d611))
* dll entry add twice ([b6ea331](https://github.com/easy-team/easywebpack/commit/b6ea331f84614bedade39d79578712e650dffe12))
* entry file extend params bug ([dd51af6](https://github.com/easy-team/easywebpack/commit/dd51af611f2d058d8796ec230b16cbc3c0963d02))
* remove unused text ([d386ab2](https://github.com/easy-team/easywebpack/commit/d386ab249243c05c353116d11744cd1dba8f362e))



## [3.5.9](https://github.com/easy-team/easywebpack/compare/3.5.7...3.5.9) (2018-01-04)


### Bug Fixes

* plugins is undefined ([3f424ee](https://github.com/easy-team/easywebpack/commit/3f424eebcbfa024dd19a365865c4953ec0a51861))
* publicPath override for cdn url ([e9bd048](https://github.com/easy-team/easywebpack/commit/e9bd0484318cca66ad33678c6e8c066ae6447a7c))



## [3.5.7](https://github.com/easy-team/easywebpack/compare/3.5.6...3.5.7) (2018-01-04)


### Bug Fixes

* module undefined  when typescript module dev hot add or delete ([ca98e62](https://github.com/easy-team/easywebpack/commit/ca98e625155642b4722944c057a6ba4d782c95bb))


### Features

* auto open manifest when use dll ([747db32](https://github.com/easy-team/easywebpack/commit/747db3260ae9d9403d9e311d661213790b652a9c))



## [3.5.6](https://github.com/easy-team/easywebpack/compare/3.5.5...3.5.6) (2017-12-27)


### Bug Fixes

* dynamic install pkg: config.install ([6314cb9](https://github.com/easy-team/easywebpack/commit/6314cb9de83fb2869d536aea25ea028e96111a36))



## [3.5.5](https://github.com/easy-team/easywebpack/compare/3.5.4...3.5.5) (2017-12-26)



## [3.5.4](https://github.com/easy-team/easywebpack/compare/3.5.2...3.5.4) (2017-12-26)


### Features

* dll auto checkout and fix dll path error ([2bf4920](https://github.com/easy-team/easywebpack/commit/2bf49201fff75004f4fb54f9cd9e4e849164bb53))
* support auto check dll config modify, rebuild dll ([6429490](https://github.com/easy-team/easywebpack/commit/6429490e7aa6eeeb0c7293ce53f082272f3794ba))



## [3.5.2](https://github.com/easy-team/easywebpack/compare/3.5.1...3.5.2) (2017-12-25)



## [3.5.1](https://github.com/easy-team/easywebpack/compare/3.5.0...3.5.1) (2017-12-22)


### Bug Fixes

* modify default publicPath, dll publicPath not update ([4c553b9](https://github.com/easy-team/easywebpack/commit/4c553b97deeeddb5f274622a02b5c152d1271bee))



# [3.5.0](https://github.com/easy-team/easywebpack/compare/3.5.0-rc.7...3.5.0) (2017-12-21)


### Bug Fixes

* css extract config use cssExtract ([25b386b](https://github.com/easy-team/easywebpack/commit/25b386b1944aa68f8072af465a628b685143d82a))
* css module and css extract ([5abc2f4](https://github.com/easy-team/easywebpack/commit/5abc2f45f1a2d42b6a98944de22596f7da443b57))
* get entry name from entry regex ([a9ef1b2](https://github.com/easy-team/easywebpack/commit/a9ef1b202e1872f7df68d06fa32412ce19fc32c8))
* html compress error:https://github.com/jantimon/html-webpack-plugin/issues/346 ([a5a0732](https://github.com/easy-team/easywebpack/commit/a5a0732b7c56bba514a18fffe8fa595181f0da15))
* setDefine merge and add setProvide method ([723682c](https://github.com/easy-team/easywebpack/commit/723682ca9b4c08224197dea9cc593856f1e36891))



# [3.5.0-rc.7](https://github.com/easy-team/easywebpack/compare/3.5.0-beta.3...3.5.0-rc.7) (2017-12-16)


### Bug Fixes

* config merge override problem ([3c0754f](https://github.com/easy-team/easywebpack/commit/3c0754fc5f5e4387df1efb380ae6312cc897d7ef))
* create dll plugin parasm not set ([84d8c36](https://github.com/easy-team/easywebpack/commit/84d8c3605be450ea197aeb1ea1e21f27dc2fef1c))
* css module loader twice ([399b5f5](https://github.com/easy-team/easywebpack/commit/399b5f55d95287fda54eac1d24e97261bd794d6e))
* dll build env not set ([8979c9b](https://github.com/easy-team/easywebpack/commit/8979c9b51dedbe810f5b83d03b2928a9375840b6))
* dll publicPath not use host ([4ca8af9](https://github.com/easy-team/easywebpack/commit/4ca8af94c1b8f7c3b58713696ddd871d3d739345))
* node render error when external module include non js file ([420806b](https://github.com/easy-team/easywebpack/commit/420806b06c7daeb06c09cf3842158ff9c8932dea))
* ugilyJs webpack version and single install params chema error ([f95d4b0](https://github.com/easy-team/easywebpack/commit/f95d4b08327222cb375be81a476a3c1b37fc636d))
* uglifyJs config and support mult process build ([ba53cc5](https://github.com/easy-team/easywebpack/commit/ba53cc5aa3c4b4ee956f57e83eb07fec74f5ead1))
* webpack-node-externals commonjs ignore non js file ([4c13a3c](https://github.com/easy-team/easywebpack/commit/4c13a3cbe0d2d88edd49dd99c9410d1a8b1b6d0c))


### Features

* add commonsChunk alias config.lib configuration ([90a951a](https://github.com/easy-team/easywebpack/commit/90a951a8f06119d42753d574d79b1b64a57cd2b5))
* auto add alias and external to dll config ([a8194f9](https://github.com/easy-team/easywebpack/commit/a8194f9efe5760f045538789b7546a163016140c))
* dll support object and array config ([f9a2781](https://github.com/easy-team/easywebpack/commit/f9a2781e3f63863a44bc8d75e6a5e6f9d818f531))
* manifest upgrade and support low version ([f9e407f](https://github.com/easy-team/easywebpack/commit/f9e407f6ea36578b18d30d7cb701160ddf965238))
* mult dll support ([1aa5401](https://github.com/easy-team/easywebpack/commit/1aa5401330d64b62eecb916989571b4502ab7a57))
* support commonsChunk and lib params sync ([e22dcd0](https://github.com/easy-team/easywebpack/commit/e22dcd03e579482a72b740c884b6798a257802c5))
* support single install uglifyjs-webpack-plugin ([1306e9d](https://github.com/easy-team/easywebpack/commit/1306e9df99347b9eeb346a23bad7576ffdd0ab44))
* support webpack native configuration ([aa94e10](https://github.com/easy-team/easywebpack/commit/aa94e10a542b64c778ac9c9e892ae415c8ac2189))



# [3.5.0-beta.3](https://github.com/easy-team/easywebpack/compare/3.5.0-beta.1...3.5.0-beta.3) (2017-12-06)


### Features

* dll function use in project success ([f2d374f](https://github.com/easy-team/easywebpack/commit/f2d374fcee3694e085e75b4bf4063ab41081f609))
* support html dll inject ([ef96082](https://github.com/easy-team/easywebpack/commit/ef96082300489a58b40947e2025a2c93f4f50779))



# [3.5.0-beta.1](https://github.com/easy-team/easywebpack/compare/3.4.1...3.5.0-beta.1) (2017-12-04)


### Features

* add getWebpackConfig extend params:option ([24bbc0a](https://github.com/easy-team/easywebpack/commit/24bbc0a1169fa95d9099acada839b7cc6c792d9a))
* auto create dll,not single config webpack.dll.js ([e4e302d](https://github.com/easy-team/easywebpack/commit/e4e302d1140b9317a805f9ec83f57ae1724ec66d))
* support npm dynamic install check switch ([58a73ea](https://github.com/easy-team/easywebpack/commit/58a73eada1625e6955969c1405de3c5212e3327f))



## [3.4.1](https://github.com/easy-team/easywebpack/compare/3.4.0...3.4.1) (2017-12-01)


### Bug Fixes

* dynamic install dev npm module imagemin-webpack-plugin  faild when NODE_EVN=production ([8ffcdb8](https://github.com/easy-team/easywebpack/commit/8ffcdb8bcdcd4d2dc70f9c31c5bff9760cf8995c))



# [3.4.0](https://github.com/easy-team/easywebpack/compare/3.3.9...3.4.0) (2017-11-30)


### Bug Fixes

* adjust error info format ([a11ddb6](https://github.com/easy-team/easywebpack/commit/a11ddb6f3aca316f44c32eb601ecc87fa866cf9a))
* when install npm module ,show detail error info ([1fb91a7](https://github.com/easy-team/easywebpack/commit/1fb91a7e3e3cde1fd047ce95647e3ffba339a865))


### Features

* adjust default port ([0d57043](https://github.com/easy-team/easywebpack/commit/0d57043d5b51eab21a54685b853a79736c637e5e))
* support webpack-bundle-analyzer and stats-webpack-plugin ([6a61612](https://github.com/easy-team/easywebpack/commit/6a61612902c4928afa918dde1d21860800fd0aa1))



## [3.3.9](https://github.com/easy-team/easywebpack/compare/3.3.8...3.3.9) (2017-11-29)


### Bug Fixes

* import css in js not resolve ([2ec17fe](https://github.com/easy-team/easywebpack/commit/2ec17fe6c282fbdb0ad1be2431e09388be3db9e2))



## [3.3.8](https://github.com/easy-team/easywebpack/compare/3.3.7...3.3.8) (2017-11-26)



## [3.3.7](https://github.com/easy-team/easywebpack/compare/3.3.6...3.3.7) (2017-11-26)


### Features

* support html template from entry same name config ([fac5153](https://github.com/easy-team/easywebpack/commit/fac5153a91f9dc3cfd3e48be25eeafbc997dc6d9))



## [3.3.6](https://github.com/easy-team/easywebpack/compare/3.3.5...3.3.6) (2017-11-24)


### Bug Fixes

* entry hot config concat error ([779b599](https://github.com/easy-team/easywebpack/commit/779b59971a1889d64eab3e00f70519c4063c5251))



## [3.3.5](https://github.com/easy-team/easywebpack/compare/3.3.4...3.3.5) (2017-11-24)



## [3.3.4](https://github.com/easy-team/easywebpack/compare/3.3.3...3.3.4) (2017-11-23)


### Bug Fixes

* devtool env valid error ([d169c16](https://github.com/easy-team/easywebpack/commit/d169c16587de4cdb9e4e5876f43b277e7d7be3dc))



## [3.3.3](https://github.com/easy-team/easywebpack/compare/3.3.2...3.3.3) (2017-11-23)


### Bug Fixes

* server not need source map, will improve build speed ([cac96c9](https://github.com/easy-team/easywebpack/commit/cac96c9419f7edf5171baf7f20238efcea1aeaa4))



## [3.3.2](https://github.com/easy-team/easywebpack/compare/3.3.1...3.3.2) (2017-11-13)


### Bug Fixes

* CommonsChunkPlugin vendor hash change ([39de220](https://github.com/easy-team/easywebpack/commit/39de220013130f1ec68232a7d61036d4554806a6))



## [3.3.1](https://github.com/easy-team/easywebpack/compare/3.3.0...3.3.1) (2017-11-10)



# [3.3.0](https://github.com/easy-team/easywebpack/compare/3.2.7...3.3.0) (2017-11-09)


### Features

* support  manifest build info deps ([42378cd](https://github.com/easy-team/easywebpack/commit/42378cd44fcefa38edcbb09ba382698ef00351f0))



## [3.2.7](https://github.com/easy-team/easywebpack/compare/3.2.6...3.2.7) (2017-10-31)



## [3.2.6](https://github.com/easy-team/easywebpack/compare/3.2.5...3.2.6) (2017-09-27)



## [3.2.5](https://github.com/easy-team/easywebpack/compare/3.2.4...3.2.5) (2017-09-27)


### Performance Improvements

* npm-install-webpack-plugin default enable affect npm start command start speed, default to disable ([0cef741](https://github.com/easy-team/easywebpack/commit/0cef741f6554b2cbd1482bdb9438735dec47d807))



## [3.2.4](https://github.com/easy-team/easywebpack/compare/3.2.2...3.2.4) (2017-09-22)


### Bug Fixes

* server side render, egg local dev mode , proxy static resource proxy to 7001 address ([0ab1b75](https://github.com/easy-team/easywebpack/commit/0ab1b75dbc70efc9efd5bec58a1fd4422132d8ef))


### Features

* default not exclude node_modules css ([5ba4033](https://github.com/easy-team/easywebpack/commit/5ba4033f0f9b5ad7d47413e112f674781e441bf0))



## [3.2.2](https://github.com/easy-team/easywebpack/compare/3.2.1...3.2.2) (2017-09-21)


### Bug Fixes

* windows path for manifest ([0374075](https://github.com/easy-team/easywebpack/commit/03740757d973e20a64bfbaef7718cc6c5ed45976))



## [3.2.1](https://github.com/easy-team/easywebpack/compare/3.2.0...3.2.1) (2017-09-20)


### Bug Fixes

* windows isAbsolute proplem, use path.isAbsolute,not path.posix.isAbsolute ([d487358](https://github.com/easy-team/easywebpack/commit/d48735883a3294854ed06270fa1e54f43719f490))



# [3.2.0](https://github.com/easy-team/easywebpack/compare/3.1.2...3.2.0) (2017-09-20)


### Bug Fixes

* conflict from webpack3 ([f97d159](https://github.com/easy-team/easywebpack/commit/f97d15949bed196baaf16d49aa3f9f27e4708081))
* when setEnv, default config not effective ([cfc7c80](https://github.com/easy-team/easywebpack/commit/cfc7c80b4baf7412fda34e8f0b02354983d15685))



## [3.1.2](https://github.com/easy-team/easywebpack/compare/3.1.1...3.1.2) (2017-09-14)



## [3.1.1](https://github.com/easy-team/easywebpack/compare/3.1.0...3.1.1) (2017-09-13)



## [3.0.1](https://github.com/easy-team/easywebpack/compare/3.0.0...3.0.1) (2017-09-12)



## [1.0.8](https://github.com/easy-team/easywebpack/compare/1.0.7-stage...1.0.8) (2017-08-29)


### Bug Fixes

* windows load not find ,set resolveLoader ([b987bf6](https://github.com/easy-team/easywebpack/commit/b987bf6c854e141a0c87dd830806896392c9f8d6))



# [3.0.0](https://github.com/easy-team/easywebpack/compare/3.0.0-rc3...3.0.0) (2017-09-08)


### Bug Fixes

* windows buildConfig path error ([c85a123](https://github.com/easy-team/easywebpack/commit/c85a1231b3aaa2f0c0c6e42498e72e50aa82396e))



# [3.0.0-rc3](https://github.com/easy-team/easywebpack/compare/3.0.0-rc2...3.0.0-rc3) (2017-09-08)


### Features

* css module and css support impl and test ([afcd553](https://github.com/easy-team/easywebpack/commit/afcd55325232cf1d632968588cbec8f96ea47904))



# [3.0.0-rc2](https://github.com/easy-team/easywebpack/compare/3.0.0-rc1...3.0.0-rc2) (2017-09-07)



# [3.0.0-rc1](https://github.com/easy-team/easywebpack/compare/1.0.8...3.0.0-rc1) (2017-09-06)



## [1.0.8](https://github.com/easy-team/easywebpack/compare/1.0.7-stage...1.0.8) (2017-08-29)


### Bug Fixes

* windows load not find ,set resolveLoader ([b987bf6](https://github.com/easy-team/easywebpack/commit/b987bf6c854e141a0c87dd830806896392c9f8d6))



## [1.0.7-stage](https://github.com/easy-team/easywebpack/compare/1.0.6-stage...1.0.7-stage) (2017-08-21)



## [1.0.6-stage](https://github.com/easy-team/easywebpack/compare/1.0.5...1.0.6-stage) (2017-08-21)



## [1.0.5](https://github.com/easy-team/easywebpack/compare/1.0.4...1.0.5) (2017-08-21)



## [1.0.4](https://github.com/easy-team/easywebpack/compare/1.0.3...1.0.4) (2017-08-21)



## [1.0.3](https://github.com/easy-team/easywebpack/compare/1.0.2...1.0.3) (2017-08-21)


### Bug Fixes

* remove fs ([b55ac40](https://github.com/easy-team/easywebpack/commit/b55ac40dbfffcd29a2b51beaf2a9d235802aa022))



## [1.0.2](https://github.com/easy-team/easywebpack/compare/1.0.1...1.0.2) (2017-08-17)



## [1.0.1](https://github.com/easy-team/easywebpack/compare/1.0.0...1.0.1) (2017-08-17)


### Bug Fixes

* keep entry file hash stable ([a69d180](https://github.com/easy-team/easywebpack/commit/a69d180a1f2c4f792eb23b0b4ab7f8768e46257b))



# [1.0.0](https://github.com/easy-team/easywebpack/compare/0.9.8...1.0.0) (2017-08-09)



## [0.9.8](https://github.com/easy-team/easywebpack/compare/0.9.7...0.9.8) (2017-08-09)



## [0.9.7](https://github.com/easy-team/easywebpack/compare/0.9.6...0.9.7) (2017-08-07)



## [0.9.6](https://github.com/easy-team/easywebpack/compare/0.9.4...0.9.6) (2017-08-07)



## [0.9.4](https://github.com/easy-team/easywebpack/compare/0.9.3...0.9.4) (2017-08-02)


### Performance Improvements

* cache load modules ([6ea8758](https://github.com/easy-team/easywebpack/commit/6ea87589a9fec3557838725c5d56224b7f14dda5))



## [0.9.3](https://github.com/easy-team/easywebpack/compare/0.8.1...0.9.3) (2017-07-31)



## [0.8.1](https://github.com/easy-team/easywebpack/compare/0.7.2...0.8.1) (2017-07-25)



## [0.7.2](https://github.com/easy-team/easywebpack/compare/0.6.4...0.7.2) (2017-07-18)


### Features

* static resource proxy ([231c394](https://github.com/easy-team/easywebpack/commit/231c394954d6721daca615ee6a67fe938e86c954))



## [0.6.4](https://github.com/easy-team/easywebpack/compare/0.6.3...0.6.4) (2017-07-13)



## [0.6.3](https://github.com/easy-team/easywebpack/compare/0.6.0...0.6.3) (2017-07-12)



# [0.6.0](https://github.com/easy-team/easywebpack/compare/0.5.15...0.6.0) (2017-07-11)



## [0.5.15](https://github.com/easy-team/easywebpack/compare/0.5.14...0.5.15) (2017-07-07)



## [0.5.14](https://github.com/easy-team/easywebpack/compare/0.5.13...0.5.14) (2017-07-05)



## [0.5.13](https://github.com/easy-team/easywebpack/compare/0.5.10...0.5.13) (2017-07-04)



## [0.5.10](https://github.com/easy-team/easywebpack/compare/0.5.9...0.5.10) (2017-06-28)



## [0.5.9](https://github.com/easy-team/easywebpack/compare/0.5.5...0.5.9) (2017-06-28)



## [0.5.5](https://github.com/easy-team/easywebpack/compare/0.5.1...0.5.5) (2017-06-25)



## [0.5.1](https://github.com/easy-team/easywebpack/compare/0.4.1...0.5.1) (2017-06-21)



## [0.4.1](https://github.com/easy-team/easywebpack/compare/0.4.0...0.4.1) (2017-06-19)



# [0.4.0](https://github.com/easy-team/easywebpack/compare/0.3.4...0.4.0) (2017-06-15)



## [0.3.4](https://github.com/easy-team/easywebpack/compare/0.3.3...0.3.4) (2017-06-12)



## [0.3.3](https://github.com/easy-team/easywebpack/compare/0.3.2...0.3.3) (2017-06-12)



## [0.3.2](https://github.com/easy-team/easywebpack/compare/0.3.1...0.3.2) (2017-06-09)



## [0.3.1](https://github.com/easy-team/easywebpack/compare/0.3.0...0.3.1) (2017-06-09)



# [0.3.0](https://github.com/easy-team/easywebpack/compare/0.2.2...0.3.0) (2017-06-09)



## [0.2.2](https://github.com/easy-team/easywebpack/compare/0.2.1...0.2.2) (2017-06-07)



## [0.2.1](https://github.com/easy-team/easywebpack/compare/0.2.0...0.2.1) (2017-05-27)



# [0.2.0](https://github.com/easy-team/easywebpack/compare/0.1.1...0.2.0) (2017-05-27)



## [0.1.1](https://github.com/easy-team/easywebpack/compare/0.1.0...0.1.1) (2017-05-12)



# [0.1.0](https://github.com/easy-team/easywebpack/compare/0.0.3...0.1.0) (2017-05-11)



## [0.0.3](https://github.com/easy-team/easywebpack/compare/0.0.2...0.0.3) (2017-05-05)



## 0.0.2 (2017-05-05)



