'use strict';
const path = require('path');
const expect = require('chai').expect;
// http://chaijs.com/api/bdd/
const lib = require('../lib');
describe('lib.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#expect lib test', () => {
    it('should unit api test', () => {
      expect(true).to.be.true;
      expect(false).to.be.false;
      expect(undefined).to.be.undefined;
      expect([1,2,3]).to.have.property(1);
      expect(['.js','.jsx','.vue']).to.include.members(['.js','.jsx']);
      expect({id: 1, name: 'sky'}).to.include.all.keys(['id', 'name']);
      expect(lib).to.have.property('test');
    });
  });
});