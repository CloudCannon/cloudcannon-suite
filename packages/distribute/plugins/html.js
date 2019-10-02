const PluginError = require("plugin-error");
const through = require("through2").obj;
const cheerio = require("cheerio");
const srcsetParser = require("srcset");
const path = require("path");
const rewriteCSS = require("./css").rewrite;
const IGNORE_URL_REGEX = /^([a-z]+\:|\/\/|\#)/;

function rewritePath(sitePath, baseurl, href) {
	if (IGNORE_URL_REGEX.test(href)) {
		return href;
	}

	let absolutePath = path.resolve(path.dirname(sitePath), href);
	return "/" + path.join(baseurl, absolutePath);
}

function rewriteHTML(html, sitePath, baseurl, extraSrcAttrs) {
	extraSrcAttrs = extraSrcAttrs || [];

	var $ = cheerio.load(html, { _useHtmlParser2: true, lowerCaseAttributeNames:false, decodeEntities: false });

	$("[href]").each(function () {
		var $el = $(this),
			href = $el.attr("href"),
			updated = rewritePath(sitePath, baseurl, href);

		if (updated !== href) {
			$el.attr("href", updated);
		}
	});


	let srcAttrs = ["src", "poster"].concat(extraSrcAttrs);
	for (let i = 0; i < srcAttrs.length; i++) {
		const srcAttr = srcAttrs[i];

		$("[" + srcAttr + "]").each(function () {
			var $el = $(this),
				originalValue = $el.attr(srcAttr),
				updated = rewritePath(sitePath, baseurl, originalValue);

			if (updated !== originalValue) {
				$el.attr(srcAttr, updated);
			}
		});
	}
	
	$("[srcset]").each(function () {
		var $el = $(this),
			srcset = $el.attr("srcset"),
			parsed = srcsetParser.parse(srcset);

		for (var i = 0; i < parsed.length; i++) {
			parsed[i].url = rewritePath(sitePath, baseurl, parsed[i].url);
		}

		var updated = srcsetParser.stringify(parsed);

		if (updated !== srcset) {
			$el.attr("srcset", updated);
		}
	});

	$("meta[http-equiv='refresh']").each(function () {
		var $el = $(this),
			content = $el.attr("content"),
			parts = content.split(";");

		for (var i = 0; i < parts.length; i++) {
			if (parts[i].indexOf("url=") === 0) {
				var href = parts[i].substring(4),
					updated = rewritePath(sitePath, baseurl, href);

				if (updated !== href) {
					parts[i] = "url=" + updated;
					$el.attr("content", parts.join(";"));
				}
				return;
			}
		}
	});

	
	$("[style]").each(function () {
		var $el = $(this),
			css = $el.attr("style"),
			updated = rewriteCSS(css, sitePath, baseurl);

		if (updated !== css) {
			$el.attr("style", updated);
		}
	});

	$("style").each(function () {
		var $el = $(this),
			css = $el.html(),
			updated = rewriteCSS(css, sitePath, baseurl);

		if (updated !== css) {
			$el.html(updated);
		}
	});

	return $.html();
}

module.exports = {
	rewrite: rewriteHTML,
	plugin: function (options) {
		options = options || {};

		return through(function (file, encoding, callback) {
			if (file.isNull()) {
				return callback(null, file);
			}
			if (file.isStream()) {
				return callback(new PluginError("cloudcannon-suite-dist-html", "Streaming not supported"));
			}

			file.sitePath = "/" + file.path.substring(file.base.length);
			file.sitePath = file.sitePath.replace(/\/index.html?/i, "/");
			let raw = file.contents.toString(encoding);
			let rewritten = rewriteHTML(raw, file.sitePath, options.baseurl);
			file.contents = Buffer.from(rewritten);
			this.push(file);
			callback();
		});
	}
};