
'use strict';
const path = require('path');
const expect = require('chai').expect;
const semver = require('semver');
const runscript = require('runscript');
const { isVue3, getVueLoadPlugin } = require('../lib/utils');

describe('test/utils.test.js', () => {
  describe('#semver test', () => {
    it('should semver api work', () => {
      expect(semver.gte('3.0.0', semver.coerce('3'))).to.be.true;
      expect(semver.gte(semver.coerce('3.0.0-beta.1').version, '3.0.0')).to.be.true;
    });
    it('should vue3 work', async () => {
      const cwd = path.join(__dirname, 'fixture', 'vue3');
      await runscript('npm install', { cwd });
      expect(isVue3(cwd)).to.be.true;
    });
    it('should not vue3 work', async () => {
      const cwd = path.join(__dirname, 'fixture', 'vue2');
      await runscript('npm install', { cwd });
      expect(isVue3(cwd)).to.be.false;
    });
  })
});