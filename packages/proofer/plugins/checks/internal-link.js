const reporter = require("../reporter.js");
const cache = require('../cache');
const Promise = require("bluebird");
const p = require('path');
const fs = Promise.promisifyAll(require("fs"));
const	cheerio = require("cheerio");
const	urlParse = require("url-parse");
const concurrency = 10;

var internalLink = function internalLink() {

	this.links = {};

	this.run = function ($el, attr, value, file, options) {
		if (this.skipChecks(options)) {
			return true;
		}

		var path = this.getPath(file, value, options);

		if (options.ignore_mailto && path.includes("mailto:")) {
			return;
		}
		if (options.ignore_cc_editor_links && path.includes("cloudcannon:")) {
			return;
		}

		if (! (path in this.links)) {
			this.links[path] = [];
		}

		this.links[path].push({$el: $el, attr: attr, value: value, file: file, options: options});
	},

	this.skipChecks = function (options) {
		return 'external_only' in options 
			&& options['external_only'] === true;
	},

	this.getPath = function (file, value, options) {
		var path;

		if (value.startsWith('/')) {
			if (file.base[-1] === "/") {
				value = value.substring(1);
			}
			path = file.base + value;
		} else {
			var currentDir = file.path.split('/');
			currentDir.pop();
			currentDir = currentDir.join('/');
			path = p.resolve(currentDir, value);
		}
		
		return this.handlePathEdgeCases(path, options);
	},

	this.reportBulk = function (links, message) {
		for (var i in links) {
			reporter.log(links[i].file, links[i].$el, message);
		}
	},

	this.handlePathEdgeCases = function (path, options) {
		var url = urlParse(path);
		url.set('hash', '');
		url.set('query', '');

		path = url.toString();

		if (path[path.length -1] == '/') {
			path += options['directory_index_file'];
		}
		
		if (p.extname(path) === '' && this.assumeExtension(options)) {
			path += options['extension']
		}

		return path;
	},

	this.assumeExtension = function (options) {
		return 'assume_extension' in options 
			&& options['assume_extension'] === true;
	},

	this.fileExists = function (path, callback) {
			if (cache.get(path) !== null) {
				return new Promise((resolve, reject) => {
					resolve(true);
				});
			} 
			
			return fs.accessAsync(path, fs.constants.F_OK).then(() => {
				return true;
			}).catch((e) => {
				return false;
			});
	},

	this.finalize = function () {
		return Promise.map(Object.keys(this.links), (path) => {
			return this.checkLink(path, this.links[path]);
		},
		{ concurrency: concurrency });
	},

	this.checkLink = function (path, linkData) {
		return this.fileExists(path)
			.then((exists) => {
				if (exists) {
					if (p.extname(path) === linkData[0].options['extension'] 
							&& this.checkHash(linkData)) {
						return this.getFile(path);
					} else {
						return new Promise((resolve, reject) => { 
							cache.add(path, {}, false);
							reject(1);
						});
					}
				} else {
					return new Promise((resolve, reject) => { 
						this.reportBulk(linkData, "404 - Page missing " + path);
						reject(1);
					});
				}
				
			}).then(($) => {
				for (var i in linkData) {
					var hash = urlParse(linkData[i].value).hash;
					if (hash !== '' && hash !== "#" && $(hash).length <= 0) {
						reporter.log(linkData[i].file, linkData[i].$el, "Hash " + hash + " not found at " + path);
					}
				}

				return true;
			}).catch((e) => {
				if (e === 1) {
					return true;
				} else {
					console.error(e.stack);
				}
		});
	},

	this.checkHash = function (links) {
		for (var i in links) {
			if (urlParse(links[i].value).hash !== '') {
				return true;
			}
		}

		return false;
	},

	this.getFile = function (path) {
		var file = cache.get(path);

		if (file !== null) {
			return new Promise((resolve, reject) => {
				return resolve(file);
			});
		} else {
			return fs.readFileAsync(path, 'utf8').then((content) => {
				var $ = cheerio.load(content, { lowerCaseAttributeNames:false, decodeEntities: false, withStartIndices: true, xmlMode: true});
				cache.add(path, $, false);
				return $;
			}).catch((e) => {
				console.log(e);
			})
		}
	}
}

// Holds singleton
internalLink.instance = null;

internalLink.getInstance = function () {
	if (this.instance === null) {
		this.instance = new internalLink();
	}
	return this.instance;
}

module.exports = internalLink.getInstance();