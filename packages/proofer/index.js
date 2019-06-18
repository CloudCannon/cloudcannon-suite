const del = require('del');
const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync').create();
const defaults = require("defaults");
const controller = require('./plugins/controller');
const configDefaults = require('./defaults.js');

module.exports = function (gulp, config) {
	config = config || {};
	config = defaults(configDefaults, config);

	gulp.task('proof:serve', function (done) {
		browserSync.init({
			server: {
				baseDir: config.output
			},
			port: config.port
		});
		done();
	});

	gulp.task("proof:watch", function () {
		gulp.watch(config.src + "/**/*", {delay: 1000}, gulp.series("proof:build"));
		gulp.watch(config.output + "/**/*", {delay: 1000}, gulp.series("proof:browser-sync"));
	});

	gulp.task("proof:browser-sync", function (done) {
		browserSync.reload();
		done();
	});

	gulp.task('proof:add-interface', function (done) {
		fs.copyFile(path.join(__dirname, "./index.html"), path.join(config.output, "/index.html"), done);
	});
	
	gulp.task('proof:check', function() {
		return gulp.src(config.src + "/**/*" + config['extension'])
			.pipe(controller.start(config));
	});

	gulp.task("proof:clean", function() {
		return del(config.output);
	});

	gulp.task('proof:build', gulp.series('proof:clean', 'proof:check', 'proof:add-interface'));

	gulp.task('proof', gulp.series('proof:build', 'proof:serve', 'proof:watch'));

	gulp.task("proof:double-check", gulp.series("proof:check", 'proof:clean', "proof:check"));
};