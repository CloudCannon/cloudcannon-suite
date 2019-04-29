const reporter = require("../reporter.js");
const cache = require('../cache');
const Promise = require("bluebird");
const	urlParse = require("url-parse");
const request = Promise.promisify(require("request"));
const	cheerio = require("cheerio");
const concurrency = 10;

var externalLink = function externalLink() {

	this.links = {};

	this.run = function ($el, attr, value, file, options) {
		if (this.skipChecks(value, options)) {
			return true;
		}
		var url = this.getPath(value);

		if (this.validateImage(url, $el, options)) {
			reporter.log(file, $el, "img doesn't have https src");
		} else if (this.validateHttps(url, options)) {
			reporter.log(file, "element doesn't have https src");
		}

		if (! (url in this.links)) {
			this.links[url] = [];
		}

		this.links[url].push({$el: $el, attr: attr, value: value, file: file, options: options});
	},

	this.getPath = function (path) {
		var url = urlParse(path);
		url.set('hash', '');
		url.set('query', '');

		return url.toString();
	},

	this.skipChecks = function (value, options) {
		return ('disable_external' in options && options['disable_external'] === true) ||
		!(/(^https*:)|(^)\/\//.test(value));
	},

	this.validateImage = function (url, $el, options) {
		return (!this.isHttps(url)) && $el[0].name == 'img' && 'check_img_http' in options 
			&& options['check_img_http'] === true;
	},

	this.validateHttps = function (url, options) {
		return (!this.isHttps(url)) && 'enforce_https' in options 
			&& options['enforce_https'] === true;
	},

	this.isHttps = function (url) {
		return /(^https:)|(^)\/\//.test(url);
	},

	this.finalize = function (callback) {
		return Promise.map(Object.keys(this.links), (path) => {
			return this.checkLink(path, this.links[path]);
		},
		{ concurrency: concurrency });
	},

	this.checkLink = function (url, links, callback) {
		return this.urlExists(url)
		.then((statusCode) => {
			if (statusCode === false) {
				return new Promise((resolve, reject) => { 
					this.reportBulk(links, "Couldn't connect to " + url);
					reject(1);
				});
			}

			if (this.handleStatusCode(statusCode, url, links) 
					&& this.checkExternalHash(links)) {
				
				return this.performExternalHashCheck(url);
			} else {
				return new Promise((resolve, reject) => { 
					reject(1);
				});
			}
		}).then((content) => {
			var $ = cheerio.load(content, { lowerCaseAttributeNames:false, decodeEntities: false});
			for (var i in links) {
				var hash = urlParse(links[i].value).hash;
				if (hash !== '' && $(hash).length <= 0) {
					reporter.log(links[i].file, links[i].$el, "Hash " + hash + " not found at " + url);
				}
			}
		}).catch((err) => {
			if (err === 1) {
				return true;
			}
		});
	},

	this.reportBulk = function (links, message) {
		for (var i in links) {
			reporter.log(links[i].file, links[i].$el, message);
		}
	},

	this.checkExternalHash = function (links) {
		if (!('check_external_hash' in links[0].options 
				&& links[0].options['check_external_hash'] === true)) {
			return false;
		}

		for (var i in links) {
			if (urlParse(links[i].value).hash !== '') {
				return true;
			}
		}

		return false;
	},

	this.urlExists = function (url) {
		var result = cache.get(url);

		if (result !== null) {
			return new Promise((resolve, reject) => {
				resolve(result.status);
			});
		}

		return this.headUrl(url)
		.then((statusCode) => {
			result = { status: statusCode, body: null };
			cache.add(url, result, true);
			return statusCode;
		}).catch((err) => {
			return false;
		});
	},

	this.performExternalHashCheck = function (url) {
		var result = cache.get(url);

		if (result !== null 
				&& 'body' in result 
				&& result.body !== null) {
			return new Promise((resolve, reject) => {
				resolve(result.body);
			});
		} else {
			return request(url).then((response) => {
				result = { status: response.statusCode, body: response.body };
				cache.add(url, result, true);
				return response.body;
			}).catch((err) => {
				throw err;
			});
		}
	},

	this.headUrl = function (url, callback) {
		return request({ url: url, method: 'HEAD' })
		.then((res) => {
			return res.statusCode;
		}).catch((err) => {
			throw err;
		});
	},

	this.makeRequest = function (p) {
		if (typeof p === 'string') {
			p = this.replaceProtocoless(p);
		} else {
			p.url = this.replaceProtocoless(p.url);
		}
		return request(p);
	},

	this.replaceProtocoless = function(url) {
		return url.replace(/^\/\//, 'https://');
	},

	this.handleStatusCode = function (statusCode, url, links) {
		if (this.sendStatusError(statusCode, '4', links[0].options)) {
			this.reportBulk(links, "URL (" + url + ") returns a " + statusCode + " error")
			return false;
		}

		if (this.sendStatusError(statusCode, '5', links[0].options)) {
			this.reportBulk(links, "URL (" + url + ") returns a " + statusCode + " error")
			return false;
		}

		return true;
	}

	this.sendStatusError = function (statusCode, checkCode, options) {
		if (typeof checkCode === 'string') {
			if (statusCode.toString().charAt(0) !== checkCode) {
				return false;
			}
		} else if (statusCode !== checkCode) {
			return false;
		}
		
		if (statusCode.toString().charAt(0) !== '4' 
				&& 'only_4xx' in options 
				&& options['only_4xx'] === true) {
			return false;
		}

		if ('http_status_ignore' in options) {
			for (var i in options['http_status_ignore']) {
				if (options['http_status_ignore'][i] === statusCode) {
					return false;
				}
			}
		}

		return true;
	}
}

// Holds singleton
externalLink.instance = null;

externalLink.getInstance = function () {
	if (this.instance === null) {
		this.instance = new externalLink();
	}
	return this.instance;
}

module.exports = externalLink.getInstance();
