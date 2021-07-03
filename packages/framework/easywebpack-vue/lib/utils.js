'use strict';
const path = require('path');
const fs = require('fs');
const semver = require('semver');

exports.getPkgVersion = (baseDir, pkgName) => {
  const cwd = baseDir || process.cwd();
  const projectPkgFilePath = path.join(cwd, 'node_modules', pkgName, 'package.json');
  if (fs.existsSync(projectPkgFilePath)) {
    return require(projectPkgFilePath).version;
  }
  try {
    const resolvePkgPath = require.resolve(pkgName);
    const pkgFilePath = path.join(resolvePkgPath, 'package.json');
    if (fs.existsSync(pkgFilePath)) {
      return require(pkgFilePath).version;
    }
  // eslint-disable-next-line no-empty
  } catch (e) {}
  return null;
};

exports.isVue3 = baseDir => {
  const version = exports.getPkgVersion(baseDir, 'vue');
  if (version) {
    return semver.gte(semver.coerce(version).version, '3.0.0');
  }
  return false;
};

exports.getVueLoadPlugin = () => {
  try {
    return require('vue-loader/lib/plugin');
  } catch (e) { // vue3
    const { VueLoaderPlugin } = require('vue-loader');
    return VueLoaderPlugin;
  }
};
