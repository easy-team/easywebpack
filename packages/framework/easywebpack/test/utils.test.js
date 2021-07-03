'use strict';
const expect = require('chai').expect;
const utils = require('../utils/utils');

describe('test/utils.test.js', () => {
  describe('#utils test', () => {
    it('should ip test', () => {
      const ip = utils.getIp();
      expect(ip.split('.').length).to.be.equal(4);
    });
    it('should getLoaderLabel test work for loader name', () => {
      const label = utils.getLoaderLabel({ loader: 'test-loader' });
      expect(label).to.be.equal('test');
    });
    it('should getLoaderLabel test work for loade path', () => {
      const label = utils.getLoaderLabel({ loader: '/easy/test/test-loader' });
      expect(label).to.be.equal('test');
    });
  });
});