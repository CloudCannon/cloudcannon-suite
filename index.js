const c = require('ansi-colors');
var pjson = require('./package.json');
console.log(c.yellow(`Running ${pjson.name} ${pjson.version}`));

module.exports = {
	dev: require("./packages/jekyll-dev"),
	i18n: require("./packages/i18n"),
	dist: require("./packages/distribute"),
	help: require("./packages/help"),
	proofer: require("./packages/proofer"),
	state: require("./packages/state"),
	screenshots: require("./packages/screenshots")
};