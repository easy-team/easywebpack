'use strict';
const expect = require('chai').expect;
const utils = require('../utils/utils');

describe('utils.test.js', () => {
  before(() => {});

  after(() => {});

  beforeEach(() => {});

  afterEach(() => {});

  describe('#utils test', () => {
    it('should ip test', () => {
      const ip = utils.getIp();
      expect(ip).to.be.not.equal('127.0.0.1');
      expect(ip.split('.').length).to.be.equal(4);
    });
  });
});