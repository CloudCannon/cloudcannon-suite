var del = require("del"),
	path = require("path"),
	defaults = require("defaults"),
	webserver = require("gulp-webserver"),
	htmlDependencies = require("./plugins/html"),
	cssDependencies = require("./plugins/css")
	//rename = require("gulp-rename"),
	//gulpSequence = require("gulp-sequence");

var configDefaults = {
	state: {
		src: "dist/site",
		dest: "reports/state",
		baseurl: ""
	},
	serve: {
		port: 9001,
		open: true,
		path: "/"
	}
};

module.exports = function (gulp, config) {
	config = config || {};

	config.state = defaults(config.state, configDefaults.state);
	config.serve = defaults(config.serve, configDefaults.serve);


	var cwd = process.cwd();
	config.state._src = config.state.src;
	config.state._dest = config.state.dest;
	config.state.src = path.join(cwd, config.state.src);
	config.state.dest = path.join(cwd, config.state.dest);

	var fullDest = path.join(config.state.dest, config.state.baseurl);

	gulp.task("state:clean", function () {
		return del(config.state.dest);
	});

	gulp.task("state:html-dependencies", function () {
		return gulp.src(config.state.src + "/**/*.html")
			.pipe(htmlDependencies({baseurl: config.state.baseurl}))
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("state:css-dependencies", function () {
		return gulp.src(config.state.src + "/**/*.css")
			.pipe(cssDependencies({baseurl: config.state.baseurl}))
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("state:clone-assets", function () {
		return gulp.src([
				config.state.src + "/**/*",
				"!" + config.state.src + "/**/*.html",
				"!" + config.state.src + "/**/*.css"
			], { nodir: true })
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("state:build", gulp.series("state:clean", gulp.parallel("state:html-dependencies", "state:css-dependencies", "state:clone-assets")));
	//gulp.task("state:build", gulpSequence("state:clean", ["state:html-dependencies", "state:css-dependencies", "state:clone-assets"]));


	// -----
	// Serve

	gulp.task("state:watch", function () {
		gulp.watch(config.state._src + "/**/*", gulp.series("state:build"));
	});

	gulp.task("state:serve", gulp.series("state:build", function() {
		return gulp.src(config.state.dest)
			.pipe(webserver({
				open: path.join(config.state.baseurl, config.serve.path),
				port: config.serve.port
			}));
	}));


	// -------
	// Default

	gulp.task("state", gulp.series("state:serve", "state:watch"));
};
