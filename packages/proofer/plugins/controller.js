const PluginError = require("plugin-error");
const async = require('async');
const Promise = require("bluebird");
const through = require("through2").obj;
const parser = require("./parser");
const checker = require("./checker");
const reporter = require("./reporter");
const concurrency = 5;

module.exports = {
	start: function (options) {
		options = options || {};
		
		var files = [];

		return through((file, encoding, callback) => {
			this.processFile(file, encoding, files, callback);
		}, (callback) => {
			this.finalize(files, options, callback);
		});
	},

	processFile: function (file, encoding, files, callback) {
		if (file.isNull()) {
			return callback();
		}

		if (file.isStream()) {
			return callback(new PluginError("local-ejs", "Streaming not supported"));
		}

		file.src = file.contents.toString(encoding);

		files.push(file);
		callback(null, file);
	},

	finalize: function (files, options, callback) {
		Promise.map(files, (file) => { 
			return parser.parse(file, options); 
		}, 
		{ concurrency: concurrency }
		).then((files) => {
			return Promise.map(files, (file) => { 
				return checker.check(file, options); 
			}, 
			{ concurrency: concurrency });
		}).then((files) => {
			return checker.finalize();
		}).then(() => {
			reporter.output(options);
			callback();
		}).catch((error) => {
			callback(error);
		});
	}
};