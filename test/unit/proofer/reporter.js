const assert = require('assert');
const	cheerio = require("cheerio");
const reporter = require("../../../packages/proofer/plugins/reporter.js");

const cheerioOptions = require("../../helper/proofer/cheerio-options.json");

describe('reporter', function() {
  describe('lineNumber', function() {
    it('Output correct line number', function() {
      var src = '<p data-proofer-ignore><b>hello</b></p><p>untouchable</p>';
      var $ = cheerio.load(src, cheerioOptions);
      assert.equal(reporter.lineNumber(src, $('b').first()), 1);
    });

    it('Output correct line number', function() {
      var src = '<p data-proofer-ignore>\n\n<b>hello</b></p>\n<p>untouchable</p>';
      var $ = cheerio.load(src, cheerioOptions);
      assert.equal(reporter.lineNumber(src, $('b').first()), 3);
    });

    it('Output correct line number', function() {
      var src = '<p data-proofer-ignore>\n\n<b>hello</b></p>\n<p id="e">untouchable</p>';
      var $ = cheerio.load(src, cheerioOptions);
      assert.equal(reporter.lineNumber(src, $('#e').first()), 4);
    });
  });

  describe('log', function() {
    it('Stores a log', function() {
      var src = '<p data-proofer-ignore>\n\n<b>hello</b></p>\n<p id="e">untouchable</p>';
      var $ = cheerio.load(src, cheerioOptions);
      var file = {
        src: src,
        $: $,
        sitePath: '/index.html'
      }
      var message = 'Your <p> is wrong';

      var result = reporter.log(file, $('#e').first(), message);
      assert.equal(4, result.lineNumber);
      assert.equal(file.sitePath, result.path);
      assert.equal(message, result.message);
    });

    it('Stores a favicon log', function() {
      var src = '<html>\n<head><link rel="ico" href="/favicon.ico"></head><body></body></html>';
      var $ = cheerio.load(src, cheerioOptions);
      var file = {
        src: src,
        $: $,
        sitePath: '/index.html'
      }
      var message = 'Your favicon is missing';

      var result = reporter.log(file, $, message);
      assert.equal(1, result.lineNumber);
      assert.equal(file.sitePath, result.path);
      assert.equal(message, result.message);
    });
  });
});