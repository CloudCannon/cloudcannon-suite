const c = require('ansi-colors');
var pjson = require('./package.json');
console.log(c.yellow(`Running ${pjson.name} ${pjson.version}`));

module.exports = {
	dev: require("./packages/jekyll-dev"),
	jekyllDev: require("./packages/jekyll-dev"),
	screenshots: require("./packages/screenshots"),
	i18n: require("./packages/i18n"),
	dist: require("./packages/distribute"),
	help: require("./packages/help")
};