const assert = require('assert');
const	cheerio = require("cheerio");
const favicon = require("../../../packages/proofer/plugins/checks/favicon.js");

const cheerioOptions = require("../../helper/proofer/cheerio-options.json");

describe('favicon', function() {
  describe('skipChecks', function() {
    it('skip if check_favicon is false', function() {
      assert(favicon.skipChecks({ check_favicon: false }));
    });

    it('don\'t skip if check_favicon is true', function() {
      assert(!favicon.skipChecks({ check_favicon: true }));
    });

    it('skip if external_only is false', function() {
      assert(favicon.skipChecks({ external_only: true }));
    });
  });

  describe('check', function() {
    it('valid favicon', function() {
      var src = '<html><head><link rel="icon" href="/favicon.ico"></head><body></body></html>';
      var $ = cheerio.load(src, cheerioOptions);
      assert(favicon.checkFavicon($('head link').first(), {}));
    });

    it('valid favicon', function() {
      var src = '<html><head><link rel="shortcut icon" href="/favicon.ico"></head><body></body></html>';
      var $ = cheerio.load(src, cheerioOptions);
      assert(favicon.checkFavicon($('head link').first(), {}));
    });

    it('invalid favicon', function() {
      var src = '<html><head><link rel="ico" href="/favicon.ico"></head><body></body></html>';
      var $ = cheerio.load(src, cheerioOptions);
      assert(!favicon.checkFavicon($('head link').first(), {}));
    });
  });
});