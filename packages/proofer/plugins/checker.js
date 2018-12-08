const Promise = require("bluebird");
const concurrency = 3;
const checkers = [
	require("./checks/alt-tag.js"),
	require("./checks/favicon.js"),
	require("./checks/link.js")
];

module.exports = {
	check: function (file, options) {
		return Promise.map(checkers, (check) => { 
			return check.run(file, options);
		},
		{ concurrency: concurrency });
	},

	finalize: function () {
		return Promise.map(checkers, (check) => {
			if (typeof check.finalize === "function") {
				return check.finalize();
			} else {
				return true;
			}
		},
		{ concurrency: concurrency });
	}
};