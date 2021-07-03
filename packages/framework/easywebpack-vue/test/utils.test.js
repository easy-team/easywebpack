
'use strict';
const expect = require('chai').expect;
const semver = require('semver');

describe('test/utils.test.js', () => {
  describe('#semver test', () => {
    it('should semver api work', () => {
      expect(semver.gte('3.0.0', semver.coerce('3'))).to.be.true;
      expect(semver.gte(semver.coerce('3.0.0-beta.1').version, '3.0.0')).to.be.true;
    });
  })
});