const assert = require('assert');
const	cheerio = require("cheerio");
const internalLink = require("../../../packages/proofer/plugins/checks/internal-link.js");

const cheerioOptions = require("../../helper/proofer/cheerio-options.json");

describe('internalLink', function() {
  describe('skipChecks', function() {
    it('skip if external_only is true', function() {
      assert(internalLink.skipChecks({ external_only: true }));
    });

    it('don\'t skip if external_only is false', function() {
      assert(!internalLink.skipChecks({ external_only: false }));
    });
  });

  describe('getPath', function() {
    it('returns correct path from absolute uri', function() {
      assert.equal(
        internalLink.getPath({ base: '/my/site/', path: '/my/site/index.html'}, 'about.html'),
        '/my/site/about.html'  
      );
    });

    it('returns correct path from relative uri', function() {
      assert.equal(
        internalLink.getPath({ base: '/my/site/', path: '/my/site/index.html'}, './something/about.html'),
        '/my/site/something/about.html'  
      );
    });

    it('returns correct path from relative uri', function() {
      assert.equal(
        internalLink.getPath({ base: '/my/site/', path: '/my/site/about/index.html'}, '../something/about.html'),
        '/my/site/something/about.html'  
      );
    });
  });

  describe('handlePathEdgeCases', function() {
    it('handles directories', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book/', { directory_index_file: 'index.html' }),
        '/book/index.html'  
      );
    });

    it('handles directory with hash', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book/#hi', { directory_index_file: 'index.html' }),
        '/book/index.html'  
      );
    });

    it('handles directory with query string', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book/?hi=hello', { directory_index_file: 'index.html' }),
        '/book/index.html'  
      );
    });

    it('doesn\'t rewrite non directory', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book', { directory_index_file: 'index.html' }),
        '/book'  
      );
    });

    it('doesn\'t rewrite non directory', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book.html', { directory_index_file: 'index.html' }),
        '/book.html'  
      );
    });

    it('assumes an extension', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book', { assume_extension: true, extension: '.html' }),
        '/book.html'  
      );
    });

    it('handles hash with extensionless', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book#hi', { assume_extension: true, extension: '.html' }),
        '/book.html'  
      );
    });

    it('handles querystring with extensionless', function() {
      assert.equal(
        internalLink.handlePathEdgeCases('/book?hi=bye', { assume_extension: true, extension: '.html' }),
        '/book.html'  
      );
    });
  });
});