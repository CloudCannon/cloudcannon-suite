var del = require("del"),
	path = require("path"),
	defaults = require("defaults"),
	webserver = require("gulp-webserver"),
	htmlDependencies = require("./plugins/html"),
	cssDependencies = require("./plugins/css"),
	rename = require("gulp-rename"),
	gulpSequence = require("gulp-sequence");

var configDefaults = {
	state: {
		src: "dist/site",
		dest: "reports/state"
	},
	serve: {
		port: 9001,
		open: true,
		path: "/"
	}
};

module.exports = function (gulp, config) {
	config = config || {};

	config.state = defaults(config.state, configDefaults.dist);
	config.serve = defaults(config.serve, configDefaults.serve);


	var cwd = process.cwd();
	config.state._src = config.state.src;
	config.state._dest = config.state.dest;
	config.state.src = path.join(cwd, config.state.src);
	config.state.dest = path.join(cwd, config.state.dest);

	var fullDest = path.join(config.state.dest, config.state.baseurl);

	gulp.task("dist:clean", function () {
		return del(config.state.dest);
	});

	gulp.task("dist:html-dependencies", function () {
		return gulp.src(config.state.src + "/**/*.html")
			.pipe(htmlDependencies())
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("dist:css-dependencies", function () {
		return gulp.src(config.state.src + "/**/*.css")
			.pipe(cssDependencies())
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("dist:clone-assets", function () {
		return gulp.src([
				config.state.src + "/**/*",
				"!" + config.state.src + "/**/*.html",
				"!" + config.state.src + "/**/*.css"
			], { nodir: true })
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("dist:build", gulpSequence("dist:clean", ["dist:html-dependencies", "dist:css-dependencies", "dist:clone-assets"]));

	// -----
	// Serve

	gulp.task("dist:watch", function () {
		gulp.watch(config.state._src + "/**/*", ["dist:build"]);
	});

	gulp.task("dist:serve", ["dist:build"], function() {
		return gulp.src(config.state.dest)
			.pipe(webserver({
				open: path.join(config.state.baseurl, config.serve.path),
				port: config.serve.port
			}));
	});


	// -------
	// Default

	gulp.task("dist", gulpSequence("dist:serve", "dist:watch"));
};
