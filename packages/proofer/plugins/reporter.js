const log = require("fancy-log");
const Promise = require("bluebird");
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

		log(this.outputError(l));
		
		this.logs.push(l);

		return l;
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
			throw new Error("This object cannot be instanciated");
	}

	this.output = function (options) {

		log(this.logs.length + " errors found");
		
		if ('output' in options && options.output !== '') {
			var json = JSON.stringify(this.logs);
			return fs.ensureFile(options.output)
			.then(() => {
				return fs.writeJson(options.output, this.logs)
			})
			.then(() => {
				log("Output logs to " + options.output);
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