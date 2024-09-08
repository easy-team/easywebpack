'use strict';
const path = require('path');
const fs = require('fs');
const Logger = require('./logger');
module.exports = (baseDir, options ={} )=> {
  const pkgFile = path.join(baseDir, 'package.json');
  const pkgJSON = require(pkgFile);
  pkgJSON.dependencies = pkgJSON.dependencies || {};
  pkgJSON.devDependencies = pkgJSON.devDependencies || {};

  const upgradePackages = {
    'babel-core': {
      name: '@babel/core',
      version: '^7.0.0'
    },
    'babel-loader': {
      name: 'babel-loader',
      version: '^8.0.0'
    },
    'babel-plugin-transform-class-properties': {
      name: '@babel/plugin-proposal-class-properties',
      version: '^7.0.0'
    },
    'babel-plugin-transform-object-rest-spread': {
      name: '@babel/plugin-proposal-object-rest-spread',
      version: '^7.0.0'
    },
    'babel-plugin-syntax-dynamic-import': {
      name: '@babel/plugin-syntax-dynamic-import',
      version: '^7.0.0'
    },
    'babel-plugin-transform-object-assign': {
      name: '@babel/plugin-transform-object-assign',
      version: '^7.0.0'
    },
    'babel-plugin-transform-runtime': {
      name: '@babel/plugin-transform-runtime',
      version: '^7.0.0'
    },
    'babel-preset-env': {
      name: '@babel/preset-env',
      version: '^7.0.0'
    },
    'babel-preset-react': {
      name: '@babel/preset-react',
      version: '^7.0.0',
      isAdd: !!(pkgJSON.dependencies['react'] || pkgJSON.devDependencies['react'])
    }
  }

 
  const writePackageJSON = () => {
    const upgradePackageNameList = Object.keys(upgradePackages);
    // remove and update dependencies
    Object.keys(pkgJSON.dependencies).forEach(key => {
      const has = upgradePackageNameList.some(ukey => {
        return ukey === key;
      });
      if(has) {
        delete pkgJSON.dependencies[key];
        const { name, version } = upgradePackages[name];
        pkgJSON.devDependencies[name] = version ;
      }
    });

    // remove and update devDependencies
    Object.keys(pkgJSON.devDependencies).forEach(key => {
      const has = upgradePackageNameList.some(ukey => {
        return key === ukey;
      });
      if(has) {
        delete pkgJSON.devDependencies[key];
      }
    });

    Object.keys(upgradePackages).forEach(key => {
      const { name, version, isAdd } = upgradePackages[key];
      if (isAdd !== false ) {
        pkgJSON.devDependencies[name] = version;
      }
    });

    fs.writeFileSync(pkgFile, JSON.stringify(pkgJSON, null, 2));
  }
 
  const babelrc = path.join(baseDir, '.babelrc');
  if (fs.existsSync(babelrc)) {
    const { writeBabelRC, installDeps } = require('babel-upgrade/src');
    writeBabelRC(babelrc, { write: true }).then(() => {
      writePackageJSON();
      Logger.getLogger().green('upgrade .babelrc and package.json successfully! Please reinstall the dependencies with npm install or yarn install');
    })
  }
}