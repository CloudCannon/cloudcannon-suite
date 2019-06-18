const assert = require('assert');
const	cheerio = require("cheerio");
const parser = require("../../../packages/proofer/plugins/parser.js");
const cheerioOptions = require("../../helper/proofer/cheerio-options.json");

describe('parser', function() {
  describe('filterIgnoredElements', function() {
    it('return everything if no data-proofer-ignore attribute', function() {
      var $ = cheerio.load('<img src="https://google.com/" alt="Hi">', cheerioOptions);
      assert.equal(parser.filterIgnoredElements($), $);
    });

    it('remove element with data-proofer-ignore attribute', function() {
      var $ = cheerio.load('<img data-proofer-ignore src="https://google.com/" alt="Hi">', cheerioOptions);
      assert.equal(parser.filterIgnoredElements($).html(), '');
    });

    it('removes element and children with data-proofer-ignore attribute', function() {
      var $ = cheerio.load('<p data-proofer-ignore><b>hello</b></p><p>untouchable</p>', cheerioOptions);
      assert.equal(parser.filterIgnoredElements($).html(), '<p>untouchable</p>');
    });
  });

  describe('processFile', function() {

    it('skips ignored files', function() {
      var file = {
        src: '<p>untouchable</p>',
        path: '/mike/test/site/dest/index.html',
        base: '/mike/test/site/dest/'
      }

      assert(parser.processFile(file, { file_ignore: ["/index.html"]}).skip);
    });

    it('doesn\'t skip unignored files', function() {
      var file = {
        src: '<p>untouchable</p>',
        path: '/mike/test/site/dest/about.html',
        base: '/mike/test/site/dest/'
      }

      assert.equal(false, parser.processFile(file, { file_ignore: ["/index.html"]}).skip);
    });

    it('Skips ignored files using regex', function() {
      var file = {
        src: '<p>untouchable</p>',
        path: '/mike/test/site/dest/about.html',
        base: '/mike/test/site/dest/'
      }

      assert(parser.processFile(file, { file_ignore: [/\/about.htm./]}).skip);
    });

    it('doesn\'t skips unignored files using regex', function() {
      var file = {
        src: '<p>untouchable</p>',
        path: '/mike/test/site/dest/index.html',
        base: '/mike/test/site/dest/'
      }

      assert.equal(false, parser.processFile(file, { file_ignore: [/\/about.htm./]}).skip);
    });
  });

  describe('sitePath', function() {
    it('creates the correct site path', function() {

      var file = {
        path: '/mike/test/site/dest/index.html',
        base: '/mike/test/site/dest/'
      }
      assert.equal(
        parser.sitePath(file), 
        '/index.html'
      );
    });
  });
});