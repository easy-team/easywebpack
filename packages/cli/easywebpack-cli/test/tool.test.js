'use strict';
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const expect = require('chai').expect;
const tool = require('node-tool-utils');
const baseDir = process.cwd();
// require('co-mocha');
// http://chaijs.com/api/bdd/

describe('tool.test.js', () => {
  before(() => {

  });
  after(() => {});

  beforeEach(() => {});

  afterEach(() => {});

  describe('#tool test', () => {
    it('should utils deleteFile test', function* () {
      const dist = path.join(baseDir, 'dist');
      const target = path.posix.join(dist, 'test/test/test.json');
      yield mkdirp(path.dirname(target));
      fs.writeFileSync(target, 'clearManifest')
      expect(fs.existsSync(target)).to.be.true;
      tool.deleteFile(dist);
      expect(fs.existsSync(target)).to.be.false;
    });
  });
});