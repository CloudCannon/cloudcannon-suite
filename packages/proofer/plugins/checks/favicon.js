const reporter = require("../reporter.js");

module.exports = {
	run: function (file, options) {
		return new Promise((resolve, reject) => {
			if (this.skipChecks(options)) {
				return resolve(true);
			}

			this.check(file, options);
		 
			resolve(true);
		});
	},

	check: function (file, options) {
		var found = false;
		file.$('head link').each((i, element) => {
			var $el = file.$(element);
			if (this.checkFavicon($el)) {
				found = true; 
			}
		});

		if (!found) {
			reporter.log(file, file.$, "Missing favicon");
		}
	},

	skipChecks: function (options) {
		return ('check_favicon' in options && options['check_favicon'] === false) 
			|| ('external_only' in options && options['external_only'] === true);
	},

	checkFavicon: function ($link) {
		var rel = $link.attr('rel');
		return rel.includes('icon');
	}
};
