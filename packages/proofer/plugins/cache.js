var cache = function cache() {

	this.storage = {};

	this.add = function (key, content, persist, expireIn) {
		this.storage[key] = {
			content: content,
			persist: persist,
			expires: new Date(new Date().getTime() + expireIn * 1000).getTime()
		}
	}

	this.get = function(key) {
		if (key in this.storage && this.storage[key].expires >= new Date().getTime()) {
			return this.storage[key].content;
		} else {
			return null;
		}
	}

	this.output = function() {
		console.log(this.storage);
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