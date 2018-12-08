const assert = require('assert');
const cache = require("../../../packages/proofer/plugins/cache.js");

describe('cache', function() {
  describe('get', function() {
    it('add to cache and get it back', function() {
      cache.add('test', 'abc', true, 3600);
      assert.equal(cache.get('test'), 'abc');
    });

    it('add to cache and returns null on expired', function() {
      cache.add('test', 'abc', true, -3600);
      assert.equal(cache.get('test'), null);
    });

    it('add to cache overwrites previous entry', function() {
      cache.add('test', 'abc', true, 3600);
      cache.add('test', 'bca', true, 3600);
      assert.equal(cache.get('test'), 'bca');
    });
  });
});