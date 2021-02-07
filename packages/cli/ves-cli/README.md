# ves-cli

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/ves-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ves-cli
[travis-image]: https://img.shields.io/travis/easy-team/ves-cli.svg?style=flat-square
[travis-url]: https://travis-ci.org/easy-team/ves-cli
[codecov-image]: https://img.shields.io/codecov/c/github/easy-team/ves-cli.svg?style=flat-square
[codecov-url]: https://codecov.io/github/easy-team/ves-cli?branch=master
[david-image]: https://img.shields.io/david/easy-team/ves-cli.svg?style=flat-square
[david-url]: https://david-dm.org/easy-team/ves-cli
[snyk-image]: https://snyk.io/test/npm/ves-cli/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/ves-cli
[download-image]: https://img.shields.io/npm/dm/ves-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/ves-cli

A Powerful Cross-platform [Ves](https://github.com/easy-team/ves) Node Framework CLI Tool.

## Installation

```bash
$ npm install -g ves-cli
```

Node.js >= 8.0.0 required.

## Features

- ✔︎ Ves Application Development, such as `ves dev`, `ves start`, `ves debug`, `ves test`
- ✔︎ Build with Webpack + TypeScript, such as `ves build`, `ves build --speed`, `ves build --size`
- ✔︎ Common Development Commands, such as `ves open`, `ves kill`, `ves server`

## QuickStart

- Init Application

```bash
$ ves init
```

- Development mode startup Application

```bash
$ ves dev
```

- Publish mode startup Application

```bash
$ ves build
$ ves start
```

- Webpack build size analysis

```bash
$ ves build --size
```

- TypeScript build

```bash
$ ves tsc
```

## Examples

See [ves-amdin](https://github.com/easy-team/ves-admin)

## Links

- https://github.com/easy-team/ves
- https://github.com/easy-team/easywebpack-cli
- https://www.yuque.com/easy-team/ves

## License

[MIT](LICENSE)
