'use strict';
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const expect = require('chai').expect;
const upgrade = require('../lib/upgrade');
const tool = require('node-tool-utils');
const baseDir = process.cwd();
// require('co-mocha');
// http://chaijs.com/api/bdd/

describe('upgrade.test.js', () => {
  before(() => {

  });
  after(() => {});

  beforeEach(() => {});

  afterEach(() => {});

  describe('#upgrade test', () => {
    it('should utils deleteFile test', function* () {
      const pkgFile = path.posix.join(baseDir, 'test/package.json');
      const target = path.join(baseDir, 'disttest/package.json');
      const targetDir = path.dirname(target);
      yield mkdirp(targetDir);
      fs.writeFileSync(target, JSON.stringify(require(pkgFile), null, 2), 'utf8');
      expect(fs.existsSync(target)).to.be.true;
      upgrade(targetDir);
      const targetPkgJSON = require(target);
      const dependencies = targetPkgJSON.dependencies;
      const devDependencies = targetPkgJSON.devDependencies;
      expect(dependencies['server-side-render-resource']).to.be.undefined;
      expect(dependencies['vue-server-renderer']).to.be.undefined;
      expect(dependencies['progress-bar-webpack-plugin']).to.be.undefined;
      expect(dependencies['webpack-manifest-resource-plugin']).to.be.undefined;
      expect(dependencies['babel-core']).to.be.undefined;
      expect(dependencies['babel-loader']).to.be.undefined;
      expect(dependencies['eslint-loader']).to.be.undefined;
      tool.deleteFile(targetDir);
    });
  });
});