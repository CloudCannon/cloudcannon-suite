var gutil = require("gulp-util"),
	through = require("through2").obj,
	prop = require("properties"),
	BufferStreams = require('bufferstreams');

var PLUGIN_NAME = "cloudcannon-suite-i18n-json2props";

function convertBuffer(buf) {
	var json = JSON.parse(buf.toString('utf8'));
	var output = prop.stringify(json);
	return new Buffer(output);
}

module.exports = function (options) {
	options = options || {};
	return through(function (file, encoding, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}

		if (file.isStream()) {
				file.contents = file.contents.pipe(new BufferStreams(function(err, buf, cb) {
					if (err) {
						self.emit('error', new PluginError(PLUGIN_NAME, err.message));
					} else {
						try {
							var outputBuffer = convertBuffer(buf);
							cb(null, outputBuffer);
							file.contents = outputBuffer;
						} catch (error) {
							self.emit('error', new PluginError(PLUGIN_NAME, error.message));
							cb(error);
						}
					}
				}));
		} else if (file.isBuffer()) {
				try {
					var outputBuffer = convertBuffer(file.contents);
					file.contents = outputBuffer;
				} catch (error) {
					this.emit('error', new PluginError(PLUGIN_NAME, error.message));
					return callback();
				}
		}

		file.path = gutil.replaceExtension(file.path, '.properties');
		this.push(file);
		callback();
	});
};
