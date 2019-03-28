const assert = require('assert');
const	cheerio = require("cheerio");
const link = require("../../../packages/proofer/plugins/checks/link.js");

const cheerioOptions = require("../../helper/proofer/cheerio-options.json");

describe('link', function() {
  describe('skipValidation', function() {
    it('skip if required is false and no value', function() {
      assert(link.skipValidation('', 'href', false, {}));
    });

    it('don\'t skip if required is false and value', function() {
      assert(!link.skipValidation('hello', 'href', false, {}));
    });

    it('skip if required is true, allow_missing_href is true and no value', function() {
      assert(link.skipValidation('', 'href', true, {allow_missing_href: true}));
    });

    it('don\'t skip if required is true, allow_missing_href is true, no value but src attr', function() {
      assert(!link.skipValidation('', 'src', true, {allow_missing_href: true}));
    });
  });

  describe('isDataUri', function() {
    it('checks valid data uri', function() {
      assert(link.isDataUri('data:image/gif;base64,R0lGODlhyAAiALM...DfD0QAADs='));
    });

    it('checks invalid data uri', function() {
      assert(!link.isDataUri('dimage/gif;base64,R0lGODlhyAAiALM...DfD0QAADs='));
    });
  });

  describe('isExternalUri', function() {
    it('checks valid external uri', function() {
      assert(link.isExternalUri('http://google.com/'));
    });

    it('checks valid external uri', function() {
      assert(link.isExternalUri('https://cloudcannon.com/'));
    });

    it('checks invalid external uri', function() {
      assert(!link.isExternalUri('/google.gif'));
    });
  });

  describe('ignoreUrl', function() {
    it('ignores the given url', function() {
      assert(link.ignoreUrl('/google.gif', { url_ignore: ['/google.gif'] }));
    });

    it('ignores the given url regex', function() {
    assert(link.ignoreUrl('/google.gif', { url_ignore: [/\/google.gi*/] }));
    });

    it('doesn\'t ignore the given url', function() {
      assert(!link.ignoreUrl('/google.gi', { url_ignore: ['/google.gif'] }));
    });

    it('doesn\'t ignore the given url regex', function() {
    assert(!link.ignoreUrl('/gooe.gif', { url_ignore: [/\/google.g*/] }));
    });
  });

  describe('rewriteSwapDomains', function() {
    it('returns the same domain', function() {
      var url = 'https://google.com/pic.gif';
      assert.equal(link.rewriteSwapDomains(url, {}), url);
    });

    it('turns URL to an internal link', function() {
      var url = 'https://google.com/pic.gif';
      assert.equal(link.rewriteSwapDomains(url, { internal_domains: ['google.com']}), '/pic.gif');
    });
    
    it('turns URL to an internal link', function() {
      var url = 'http://localhost:4000/docs/conduct/';
      assert.equal(link.rewriteSwapDomains(url, { internal_domains: ['localhost:4000']}), '/docs/conduct/');
    });

    it('doesn\'t switch urls if they don\'t match', function() {
      var url = 'https://google.com/pic.gif';
      assert.equal(link.rewriteSwapDomains(url, { internal_domains: ['yahoo.com']}), 'https://google.com/pic.gif');
    });

    it('swaps url', function() {
      var url = 'https://google.com/pic.gif';
      assert.equal(link.rewriteSwapDomains(url, { url_swap: { '^https://google.com': "https://yahoo.com"}}), 'https://yahoo.com/pic.gif');
    });

    it('doesn\'t swap urls if they don\'t match', function() {
      var url = 'https://example.com/pic.gif';
      assert.equal(link.rewriteSwapDomains(url, { url_swap: { '^https://google.com': 'https://yahoo.com'}}), 'https://example.com/pic.gif');
    });
  });
});