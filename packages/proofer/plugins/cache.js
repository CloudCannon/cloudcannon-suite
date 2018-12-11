const Promise = require("bluebird");
const fs = require("fs-extra");

var cache = function cache() {

	this.storage = {};
	this.options = {};

	this.add = function (key, content, persist) {
		persist = persist && this.isPersistentCache(this.options);
		this.storage[key] = {
			content: content,
			persist: persist,
			expires: this.getExpireTime(persist)
		}

	}

	this.getExpireTime = function () {
		var expireIn = 6000;
		if (this.isPersistentCache(this.options)) {
			expireIn = this.options.cache.timeframe;
		} 

		return new Date(new Date().getTime() + expireIn * 1000).getTime();
	}

	this.get = function (key) {
		if (key in this.storage && this.storage[key].expires >= new Date().getTime()) {
			return this.storage[key].content;
		} else {
			return null;
		}
	}

	this.init = function (options) {
		this.options = options;

		if (this.isPersistentCache(options)) {
			this.loadCache(options.cache.storage_dir);
		}

		return true;
	}

	this.isPersistentCache = function (options) {
		return 'cache' in options
			&& 'timeframe' in options.cache
			&& 'storage_dir' in options.cache
			&& options.cache.timeframe !== null
			&& options.storage_dir !== null;
	}

	this.loadCache = function (dir) {
		try {
			fs.ensureFileSync(dir);
			this.storage = fs.readJsonSync(dir);
		} catch (err) {}
	}

	this.persist = function () {
		if (this.isPersistentCache(this.options)) {
			return fs.ensureFile(this.options.cache.storage_dir)
			.then(() => {
				return fs.writeJson(this.options.cache.storage_dir, this.persistObj());
			})
			.catch((err) => {
				console.log(err);
			});
		} else {
			return true;
		}
	}

	this.persistObj = function () {
		let s = {};
		for (var i in this.storage) {
			if (this.storage[i].persist 
					&& this.storage[i].expires >= new Date().getTime()) {
				
				s[i] = this.storage[i];
			}
		};

		return s;
	}
}

// Holds singleton
cache.instance = null;

cache.getInstance = function () {
	if (this.instance === null) {
		this.instance = new cache();
	}
	return this.instance;
}

module.exports = cache.getInstance();