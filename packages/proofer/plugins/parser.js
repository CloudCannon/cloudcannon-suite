const	cheerio = require("cheerio");
const cache = require('./cache');

module.exports = {
	parse: function (file, options) {
		return new Promise((resolve, reject) => {
			resolve(this.processFile(file, options))
		});
	},

	sitePath: function (file) {
		return "/" + file.path.substring(file.base.length);
	},

	processFile: function (file, options) {
		file.sitePath = this.sitePath(file);
		if (this.ignoreFile(file, options.file_ignore)) {
			file.skip = true;
		} else {
			file.skip = false;
			
			var $ = cheerio.load(file.src, { lowerCaseAttributeNames:false, decodeEntities: false, withStartIndices: true, xmlMode: true});
			file.$ = this.filterIgnoredElements($); 
		}
		
		cache.add(file.path, file.$, false, 3600);

		return file;
	},

	ignoreFile: function (file, ignoreList) {
		var found = false;
		for (var i = 0; i < ignoreList.length; i++) {
			if (ignoreList[i] instanceof RegExp) {
				if (ignoreList[i].test(file.sitePath)) {
					found = true;
				}
			} else {
				if (ignoreList[i] === file.sitePath) {
					found = true;
				}
			}
		}
		return found;
	},

	filterIgnoredElements: function ($) {
		$('[data-proofer-ignore]').remove();
		return $;
	}
};