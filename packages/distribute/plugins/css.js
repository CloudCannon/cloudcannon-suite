var PluginError = require("plugin-error"),
	through = require("through2").obj,
	log = require("fancy-log"),
	URLRewriter = require("cssurl").URLRewriter,
	path = require("path");

function prepHref(href) {
	return "'" + href.replace(/'/g, "\'") + "'";
}

var IGNORE_URL_REGEX = /^([a-z]+\:|\/\/|\#)/;
module.exports = function (options) {
	options = options || {};
	return through(function (file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(new PluginError("cloudcannon-suite-dist-css", "Streaming not supported"));
		}

		file.sitePath = "/" + file.path.substring(file.base.length);
		file.sitePath = file.sitePath.replace(/\/index.html?/i, "/");

		var css = file.contents.toString(encoding);

		if (css) {
			var rewriter = new URLRewriter(function(href) {
				if (IGNORE_URL_REGEX.test(href)) {
					return prepHref(href);
				}

				var absolutePath = path.resolve(path.dirname(file.sitePath), href);
				return prepHref("/" + path.join(options.baseurl, absolutePath));
			});

			var rewritten = rewriter.rewrite(css);

			file.contents = Buffer.from(rewritten);
		}

		this.push(file);
		callback();
	});
};
