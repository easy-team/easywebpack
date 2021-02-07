'use strict';
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const Logger = require('./logger');
module.exports = (baseDir, options ={} )=> {
  const pkgFile = path.join(baseDir, 'package.json');
  const pkgJSON = require(pkgFile);
  const removePackages = [
    'autoprefixer',
    'babel-core',
    'babel-loader',
    'babel-eslint',
    'postcss-loader',
    'eslint-loader',
    'vue-template-compiler',
    'server-side-render-resource',
    'vue-server-renderer',
    'webpack-manifest-normalize',
    'html-webpack-plugin',
    'directory-named-webpack-plugin',
    'progress-bar-webpack-plugin',
    'webpack-manifest-resource-plugin',
    'uglifyjs-webpack-plugin',
    'babel-plugin-add-module-exports',
    'babel-plugin-syntax-dynamic-import',
    'babel-plugin-transform-object-assign',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-runtime',
    'babel-preset-env',
    'babel-plugin-import'
  ];
  const upgradePackages = {
    'easywebpack-cli': {
      version: '^4.0.0'
    },
    'easywebpack-vue': {
      version: '^4.0.0'
    },
    'easywebpack-react': {
      version: '^4.0.0'
    },
    'easywebpack-html': {
      version: '^4.0.0'
    },
    'easywebpack-js': {
      version: '^4.0.0'
    },
    'egg-webpack': {
      version: '^4.0.0'
    },
    'ts-loader': {
      version: '^4.0.0'
    }
  };

  pkgJSON.dependencies = pkgJSON.dependencies || {};
  pkgJSON.devDependencies = pkgJSON.devDependencies || {};

  // remove and update dependencies
  Object.keys(pkgJSON.dependencies).forEach(name => {
    if(removePackages.indexOf(name) > -1) {
      delete pkgJSON.dependencies[name];
    }
    if(upgradePackages[name]) {
      pkgJSON.dependencies[name] = upgradePackages[name].version ;
    }
  });

  // remove and update devDependencies
  Object.keys(pkgJSON.devDependencies).forEach(name => {
    if(removePackages.indexOf(name) > -1) {
      delete pkgJSON.devDependencies[name];
    }
    if(upgradePackages[name]) {
      pkgJSON.devDependencies[name] = upgradePackages[name].version ;
    }
  });

  // 规范 Egg 启动命令
  if (options.egg) {
    pkgJSON.dependencies['egg-scripts'] = '^2.9.1';
    pkgJSON.scripts.debug = 'egg-bin debug';
    pkgJSON.scripts.dev = 'egg-bin dev';
    pkgJSON.scripts.start = 'egg-scripts start';
    pkgJSON.scripts.clean = 'easy clean';
    pkgJSON.scripts.build = 'easy build';
    delete pkgJSON.scripts['dll'];
    delete pkgJSON.scripts['build:dev'];
    delete pkgJSON.scripts['build:test'];
    delete pkgJSON.scripts['build:prod'];
    delete pkgJSON.scripts['start:test'];
    delete pkgJSON.scripts['start:prod'];

    // remove ${root}/index.js
    const indexFile = path.join(baseDir, 'index.js');
    /* istanbul ignore next */
    if(fs.existsSync(indexFile)) {
      fs.unlinkSync(indexFile);
    }
  }

  // remove npm lock file
  const packageLockFile = path.join(baseDir, 'package-lock.json');
  /* istanbul ignore next */
  if(fs.existsSync(packageLockFile)) {
    fs.unlinkSync(packageLockFile);
  }

  // remove yarn lock file
  const yarnLockFile = path.join(baseDir, 'yarn.lock');
  /* istanbul ignore next */
  if(fs.existsSync(yarnLockFile)) {
    fs.unlinkSync(yarnLockFile);
  }
  fs.writeFileSync(pkgFile, JSON.stringify(pkgJSON, null, 2));
  Logger.getLogger().green('upgrade .babelrc and package.json successfully! Please reinstall the dependencies with npm install or yarn install');
}