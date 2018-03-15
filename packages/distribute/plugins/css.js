var gutil = require("gulp-util"),
	through = require("through2").obj,
	rewriteCssUrls = require("css-url-rewrite"),
	path = require("path");

module.exports = function (options) {
	options = options || {};

	function rewrite(file, href) {
		return "/" + path.join(options.baseurl, href);
	}

	return through(function (file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(new gutil.PluginError("cloudcannon-suite-dist-css", "Streaming not supported"));
		}

		file.sitePath = "/" + file.path.substring(file.base.length);
		file.sitePath = file.sitePath.replace(/\/index.html?/i, "/");

		var css = file.contente.toString(encoding);

		css = rewriteCssUrls(css, rewrite);

		callback();
	});
};