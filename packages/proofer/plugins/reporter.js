const log = require("fancy-log");
const c = require("ansi-colors");
const fs = require("fs-extra");

var reporter = function reporter(){

	this.logs = [];

	this.log = function (file, $el, message) {
		var l = {
			path: file.sitePath,
			lineNumber: this.lineNumber(file.src, $el),
			message: message,
			startIndex: this.getStartIndex($el)
		};
		
		this.logs.push(l);

		return l;
	}

	this.flushLogs = function() {
		this.logs = [];
	}

	this.getStartIndex = function ($el) {
		if (typeof $el.get !== "function") {
			return 0;
		} else {
			return $el.get(0).startIndex;
		}
	},

	this.lineNumber = function (src, $el) {
		let startIndex = this.getStartIndex($el);

		if (startIndex === undefined) {
			return 1;
		}

		var newLines = src.substr(0, startIndex).match(/\n/g) || [];
		return newLines.length + 1;
	}

	if (reporter.caller != reporter.getInstance){
			throw new Error("This object cannot be instantiated");
	}

	this.output = function (options, files) {

		log(this.logs.length + " errors found");

		files.forEach(file => {
			var errors = this.logs.filter(report => report.path === file.sitePath);
			errors.sort(function(a, b) {
				return a.lineNumber - b.lineNumber;
			});
			if (errors.length === 0) {
				log("✅ " + c.green(file.sitePath));
			} else {
				log("❌ " + file.sitePath);
				errors.forEach(function(error) {
					log(c.red(`Line ${error.lineNumber}: `) + "\t" + error.message);
				});
			}
		});
		
		if ('output' in options && options.output !== '') {
			var json = JSON.stringify(this.logs);
			return fs.ensureDir(options.output)
			.then(() => {
				return fs.writeJson(options.output + "/results.json", this.logs)
			})
			.then(() => {
				log("Output logs to " + options.output);
				this.logs = [];
			}).catch((err) => {
				console.log(err);
			});
		}

		return true;
	}

	this.outputError = function (log) {
		return log.message + " (line " + log.lineNumber + ")";
	}
}

// Holds singleton
reporter.instance = null;

reporter.getInstance = function () {
	if (this.instance === null) {
		this.instance = new reporter();
	}
	return this.instance;
}

module.exports = reporter.getInstance();