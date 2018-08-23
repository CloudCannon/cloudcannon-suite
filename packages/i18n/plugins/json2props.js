var gutil = require("gulp-util"),
	through = require("through2").obj,
	prop = require("properties");

module.exports = function (options) {
	options = options || {};
	return through(function (file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
			return callback(new gutil.PluginError("cloudcannon-suite-i18n-json2props", "Streaming not supported"));
		}

		var json = JSON.parse(file.contents.toString('utf8'));
		file.contents = prop.stringify(json);
		file.path = gutil.replaceExtension(file.path, '.properties');
		this.push(file);
		callback();
	});
};
