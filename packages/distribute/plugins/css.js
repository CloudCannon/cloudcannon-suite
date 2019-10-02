const PluginError = require("plugin-error");
const through = require("through2").obj;
const URLRewriter = require("cssurl").URLRewriter;
const path = require("path");

const IGNORE_URL_REGEX = /^([a-z]+\:|\/\/|\#)/;

function prepHref(href) {
	return "'" + href.replace(/'/g, "\'") + "'";
}

function rewriteCSS(css, sitePath, baseurl) {
	let rewriter = new URLRewriter(function(href) {
		if (IGNORE_URL_REGEX.test(href)) {
			return prepHref(href);
		}

		let absolutePath = path.resolve(path.dirname(sitePath), href);
		return prepHref("/" + path.join(baseurl, absolutePath));
	});

	return rewriter.rewrite(css);
}

module.exports = {
	rewrite: rewriteCSS,
	plugin: function (options) {
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

			let css = file.contents.toString(encoding);
			let rewritten = rewriteCSS(css, file.sitePath, options.baseurl);

			file.contents = Buffer.from(rewritten);
			this.push(file);
			callback();
		});
	}
};
