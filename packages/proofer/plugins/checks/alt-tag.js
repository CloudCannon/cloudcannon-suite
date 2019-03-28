const reporter = require("../reporter.js");

module.exports = {
	run: function (file, options) {
		return new Promise((resolve, reject) => {
			if (this.skipChecks(options)) {
				return resolve(true);
			}

			this.checkFile(file, options);
			resolve(true);
		});
	},

	skipChecks: function (options) {
		return 'external_only' in options && options['external_only'] === true;
	},

	checkFile: function (file, options) {
		file.$('img').each((i, element) => {
			var e = file.$(element);
			
			if (!this.checkAltTag(e, options)) {
				reporter.log(file, e, "Missing alt tag");
			}
		});
	},

	checkAltTag: function ($img, options) {
		if ('alt_ignore' in options 
				&& this.ignoreSrc($img.attr('src'), options.alt_ignore)) {
			return true;
		}

		var alt = $img.attr('alt');
		var check = alt !== undefined && alt !== null;

		if (!this.emptyAltAllowed(options)) {
			check = check && alt !== "";
		}

		return check;
	},

	emptyAltAllowed: function (options) {
		return 'empty_alt_ignore' in options 
			&& options['empty_alt_ignore'] === true
	},

	ignoreSrc: function (src, ignoreList) {
		for (var i = 0; i < ignoreList.length; i++) {
			if (ignoreList[i] instanceof RegExp) {
				if (ignoreList[i].test(src)) {
					return true;
				}
			} else {
				if (ignoreList[i] === src) {
					return true;
				}
			}
		}
		return false
	},
};
