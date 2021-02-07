# webpack-tool

Koa Webpack Dev Server:

- development mode, start webpack koa server, file memory, hot update.

- production mode, webpack build file to disk.

## Version

- webpack 5: webpack-tool: 5.x.x
- webpack 4: webpack-tool: 4.x.x
- webpack 3: webpack-tool: 3.x.x

## Install

```bash
$ npm i webpack-tool --save
```

## Usage

```js
//build/index.js
const WebpackTool = require('webpack-tool');
const NODE_ENV = process.env.VIEW;

const webpackTool = new WebpackTool({
  devServer: {
    before: before => {
      // register koa middleware
    },
    after: app => {
      // register koa middleware
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {'^/api' : ''}
      }
    },
    historyApiFallback: {
      index: '/app.html'
    }
  }
});

const webpackConfig = {
  entry:{
    index: './src/index.js'
  },
  module:{
    rules:[]
  }
  plugins: []
};

if (NODE_ENV === 'development') {
  // start webpack build and show build result ui view
  webpackTool.server(webpackConfig);
} else {
  // if you want to show build result ui view for build mode, please set  process.env.BUILD_VIEW=true
  webpackTool.build(webpackConfig);
}
```

## Configuration

`config.devServer` support follow option:

- `proxy` {Object} see https://webpack.docschina.org/configuration/dev-server/#devserver-proxy

- `historyApiFallback` {Object} see https://webpack.docschina.org/configuration/dev-server/#devserver-historyapifallback

- `before` {Function} see https://webpack.docschina.org/configuration/dev-server/#devserver-before

- `after` {Function} see https://webpack.docschina.org/configuration/dev-server/#devserver-after

## Run

```js
"scripts": {
  "start": "cross-env node build"
 }
```

```bash
npm start
```

Start Webpack Debug Server: http://127.0.0.1:8888/debug

![UI-VIEW](https://github.com/hubcarl/webpack-tool/blob/master/doc/webpack-tool-ui-view.png)
