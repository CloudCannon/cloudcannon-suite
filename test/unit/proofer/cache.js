const assert = require('assert');
const cache = require("../../../packages/proofer/plugins/cache.js");

describe('cache', function() {
  describe('get', function() {
    it('add to cache and get it back', function() {
      cache.add('test', 'abc', true);
      assert.equal(cache.get('test'), 'abc');
    });

    it('add to cache overwrites previous entry', function() {
      cache.add('test', 'abc', true);
      cache.add('test', 'bca', true);
      assert.equal(cache.get('test'), 'bca');
    });
  });
});