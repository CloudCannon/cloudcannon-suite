const Promise = require("bluebird");
const reporter = require("../reporter.js");
const internalLink = require("./internal-link.js");
const externalLink = require("./external-link.js");

const elements = {
	href: {
		a: true,
		area: true, 
		link: true
	},
	src: {
		audio: true,
		embed: true,
		iframe: true,
		img: true,
		input: false,
		source: true,
		track: true,
		video: true,
		script: false
	},
	icon: {
		menuitem: true
	},
	data: {
		object: true
	},
	poster: {
		video: false
	},
	longdesc: {
		iframe: false,
		img: false
	}
};


module.exports = {

	run: function (file, options) {
		return new Promise((resolve, reject) => {
			this.check(file, options);
			resolve(true);
		});
	},
	
	check: function (file, options) {
		for (var attr in elements) {
			for (var elementName in elements[attr]) {
				this.checkElement(elementName, attr, file, options);
			}
		}
	},

	checkElement: function (elementName, attr, file, options) {
		file.$(elementName).each((i, element) => {
			var $el = file.$(element).first();
			this.validateLink($el, attr, elements[attr][elementName], file, options);
		});
	},
	
	validateLink: function ($el, attr, required, file, options) {
		var value = $el.attr(attr);

		if (this.skipValidation(value, attr, required, options)) {
			return true;
		}
		
		if (value === undefined || value == null) {
			reporter.log(file, $el, attr + ' not set');
			return false;
		}

		value = value.trim();

		if (this.ignoreUrl(value, options)) {
			return true;
		}

		if (value === '#' && attr === 'href') {
			if (this.allowHashHref(options)) {
				return true;
			} else {
				reporter.log(file, $el, 'href cannot be #');
			}
		}

		if (this.isDataUri(value)) {
			return true;
		}

		value = this.rewriteSwapDomains(value, options);

		if (this.isExternalUri(value)) {
			externalLink.run($el, attr, value, file, options);
		} else {
			internalLink.run($el, attr, value, file, options);
		}
	},

	skipValidation(value, attr, required, options) {
		var skip = !required || this.allowMissingHref(attr, options);
		return skip && (value === undefined || value === null || value === "");
	},

	allowMissingHref: function (attr, options) {
		return attr === 'href' 
			&& 'allow_missing_href' in options 
			&& options['allow_missing_href'] === true;
	},

	allowHashHref: function (options) {
		return 'allow_hash_href' in options 
			&& options['allow_hash_href'] === true;
	},

	isDataUri(value) {
		return /^data:/.test(value);
	},

	isExternalUri(value) {
		return /(^[a-zA-Z]{0,5}:)|(^)\/\//.test(value);
	},

	ignoreUrl(value, options) {
		if (!'url_ignore' in options) {
			return false;
		}
		
		var ignoreList = options['url_ignore'];

		for (var i in ignoreList) {
			if (ignoreList[i] instanceof RegExp) {
				if (ignoreList[i].test(value)) {
					return true;
				}
			} else {
				if (ignoreList[i] === value) {
					return true;
				}
			}
		}
		return false;
	},

	rewriteInternalDomains: function (options) {
		if ('internal_domains' in options) {
			if (! ('url_swap' in options)) {
				options['url_swap'] = {};
			}

			for (var i in options['internal_domains']) {
				var domain = options['internal_domains'][i];
				options['url_swap']['^http://' + domain] = "";
				options['url_swap']['^https://' + domain] = "";
				options['url_swap']['^//' + domain] = "";
			}
		}

		return options;
	},

	rewriteSwapDomains: function (value, options) {
		options = this.rewriteInternalDomains(options);
		if ('url_swap' in options) {
			for (var i in options['url_swap']) {
				var reg = new RegExp(i);
				value = value.replace(reg, options['url_swap'][i]);
			}
		}

		return value;
	},

	finalize: function () {
		return Promise.all([
			internalLink.finalize(),
			externalLink.finalize()
		]);
	}
};
