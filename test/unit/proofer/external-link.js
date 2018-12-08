const assert = require('assert');
const	cheerio = require("cheerio");
const externalLink = require("../../../packages/proofer/plugins/checks/external-link.js");

describe('externalLink', function() {
  describe('sendStatusError', function() {
    it('return false if status errors don\'t match', function() {
      assert(!externalLink.sendStatusError(301, 300, {}));
    });

    it('return true if 300 status errors match', function() {
      assert(externalLink.sendStatusError(301, 301, {}));
    });

    it('return false if wildcard status errors don\'t match', function() {
      assert(!externalLink.sendStatusError(301, '4', {}));
    });

    it('return true if 300 wildcard status error matches', function() {
      assert(externalLink.sendStatusError(301, '3', {}));
    });

    it('return false if only_4xx set', function() {
      assert(!externalLink.sendStatusError(301, '3', { 'only_4xx': true }));
    });

    it('return true if only_4xx set and 400 error', function() {
      assert(externalLink.sendStatusError(401, '4', { 'only_4xx': true }));
    });

    it('return false if http_status_ignore set', function() {
      assert(!externalLink.sendStatusError(401, '4', { 'http_status_ignore': [401] }));
    });

    it('return true if http_status_ignore set for different error', function() {
      assert(externalLink.sendStatusError(401, '4', { 'http_status_ignore': [402] }));
    });
  });

  describe('skipChecks', function() {
    it('return false if valid url', function() {
      assert(!externalLink.skipChecks('https://google.com', {}));
    });

    it('return false if valid url', function() {
      assert(!externalLink.skipChecks('http://google.com', {}));
    });

    it('return true if invalid url', function() {
      assert(externalLink.skipChecks('ftp://google.com', {}));
    });

    it('return true if disable_external set', function() {
      assert(externalLink.skipChecks('http://google.com', { disable_external: true }));
    });
  });
});