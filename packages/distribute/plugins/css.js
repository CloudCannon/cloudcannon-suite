var gutil = require("gulp-util"),
	through = require("through2").obj,
	rewriteCssUrls = require("cssurl").URLRewriter,
	path = require("path");

var IGNORE_URL_REGEX = /^([a-z]+\:|\/\/|\#)/;
module.exports = function (options) {
	options = options || {};
	return through(function (file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(new gutil.PluginError("cloudcannon-suite-dist-css", "Streaming not supported"));
		}

		file.sitePath = "/" + file.path.substring(file.base.length);
		file.sitePath = file.sitePath.replace(/\/index.html?/i, "/");

		var css = file.contents.toString(encoding);

		var rewriter = new URLRewriter(function(href) {
			if (IGNORE_URL_REGEX.test(href)) {
				return href;
			}

			return "/" + path.join(options.baseurl, href);
		});

		var rewritten = rewriter.rewrite(css);

		file.contents = new Buffer(rewritten);
		this.push(file);
		callback();
	});
};
