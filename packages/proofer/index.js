const log = require('fancy-log');
const mergeOptions = require('merge-options');
const controller = require('./plugins/controller');
const configDefaults = require('./defaults.js');

module.exports = function (gulp, config) {
	config = config || {};
	config = mergeOptions(configDefaults, config);

	gulp.task('proof', (done) => {
		return gulp.src(config.src + "/**/*" + config['extension'])
			.pipe(controller.start(config));
	});
};