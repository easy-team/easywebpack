'use strict';
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const expect = require('chai').expect;
const Download = require('../lib/download');

// require('co-mocha');
// http://chaijs.com/api/bdd/

describe('download.test.js', () => {
  let download;
  before(() => {
    download = new Download({}, { name: 'easywbpack-cli' });
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#npm download cli test', () => {
    const projectDir = path.join(process.cwd(), 'dist/cli');
    it('should init cli config test', async () => {
      await download.init(projectDir, { pkgName: 'easywebpack-cli-template' });
    });

    it('should init egg-react-webpack-boilerplate test', async () => {
      await download.init(projectDir, { pkgName : 'egg-react-webpack-boilerplate'} );
    });
  });

  describe('#npm download vue boilerplate test', () => {
    const vueBoilerplate = 'egg-vue-webpack-boilerplate';
    it('should getPackageInfo', async () => {
      const pkgInfo = await download.getPackageInfo(vueBoilerplate);
      expect(pkgInfo.dist.tarball).include(vueBoilerplate);
    });
  });

  describe('#npm download vue boilerplate and copy test', () => {
    it('should download and copy', async () => {
      const vueBoilerplate = 'egg-vue-webpack-boilerplate';
      const downloadDir = await download.download(vueBoilerplate, '');
      const sourceDir = downloadDir;
      const targetDir = path.join(process.cwd(), `dist/${vueBoilerplate}`);
      await rimraf(targetDir);
      await mkdirp(targetDir);
      download.copy(sourceDir, targetDir, { hide: true });
      download.updatePackageFile(targetDir);
      expect(fs.existsSync(path.join(targetDir, 'app/router.js'))).to.be.true;
      expect(fs.existsSync(path.join(targetDir, 'babel.config.js'))).to.be.true;
    });
  });
});
