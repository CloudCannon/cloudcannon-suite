const c = require('ansi-colors');
var pjson = require('./package.json');
console.log(c.yellow(`Running ${pjson.name} ${pjson.version}`));

module.exports = {
	jekyllDev: require("./packages/jekyll-dev"),
	jekyllDocs: require("./packages/jekyll-docs"),
	screenshots: require("./packages/screenshots"),
	i18n: require("./packages/i18n"),
	dist: require("./packages/distribute"),
	help: require("./packages/help")
};