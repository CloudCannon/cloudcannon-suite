const assert = require('assert');
const	cheerio = require("cheerio");
const altTag = require("../../../packages/proofer/plugins/checks/alt-tag.js");

const cheerioOptions = require("../../helper/proofer/cheerio-options.json");

describe('altTag', function() {
  describe('checkAltTag', function() {
    it('return true if alt tag present', function() {
      var $ = cheerio.load('<img src="https://google.com/" alt="Hi">', cheerioOptions);
      assert(altTag.checkAltTag($('img').first(), {}));
    });

    it('return false if alt tag not present', function() {
      var $ = cheerio.load('<img src="https://google.com/">', cheerioOptions);
      assert(!altTag.checkAltTag($('img').first(), {}));
    });

    it('return false if alt tag empty', function() {
      var $ = cheerio.load('<img src="https://google.com/" alt="">', cheerioOptions);
      assert(!altTag.checkAltTag($('img').first(), {}));
    });

    it('return true if alt tag empty and empty_alt_ignore option is enabled', function() {
      var $ = cheerio.load('<img src="https://google.com/" alt="">', cheerioOptions);
      assert(altTag.checkAltTag($('img').first(), { empty_alt_ignore: true }));
    });

    it('return true if src in alt_ignore list', function() {
      var $ = cheerio.load('<img src="https://google.com/1.png">', cheerioOptions);
      assert(altTag.checkAltTag($('img').first(), { alt_ignore: ['https://google.com/1.png']}));
    });

    it('return false if src not in alt_ignore list', function() {
      var $ = cheerio.load('<img src="https://google.com/2.png">', cheerioOptions);
      assert(!altTag.checkAltTag($('img').first(), { alt_ignore: ['https://google.com/1.png']}));
    });

    it('return true if src in alt_ignore list regex', function() {
      var $ = cheerio.load('<img src="https://google.com/2.png">', cheerioOptions);
      assert(altTag.checkAltTag($('img').first(), { alt_ignore: [/.png/]}));
    });

    it('return false if src not in alt_ignore list regex', function() {
      var $ = cheerio.load('<img src="https://google.com/2.jpg">', cheerioOptions);
      assert(!altTag.checkAltTag($('img').first(), { alt_ignore: [/.png/]}));
    });
  });

  describe('emptyAltAllowed', function() {
    it('skips processing if empty_alt_ignore is set', function() {
      assert(altTag.emptyAltAllowed({ empty_alt_ignore: true }));
    });

    it('processes if empty_alt_ignore is set to false', function() {
      assert(!altTag.emptyAltAllowed({ empty_alt_ignore: false }));
    });

    it('processes if empty_alt_ignore isn\'t set', function() {
      assert(!altTag.emptyAltAllowed({}));
    });
  });
  
  describe('skipChecks', function() {
    it('processes if external_only is set to false', function() {
      assert(!altTag.skipChecks({ external_only: false}));
    });

    it('doesn\'t processes if external_only is set', function() {
      assert(altTag.skipChecks({ external_only: true}));
    });
  });
});