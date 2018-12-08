const log = require("fancy-log");

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
		for (var l in this.logs) {
			log(this.logs[l]);
		}
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