var del = require("del"),
	c = require("ansi-colors"),
	path = require("path"),
	defaults = require("defaults"),
	browserSync = require('browser-sync').create(),
	htmlRewrite = require("./plugins/html"),
	cssRewrite = require("./plugins/css"),
	log = require("fancy-log");

var configDefaults = {
	dist: {
		src: "dist/site",
		dest: "dist/prod",
		baseurl: ""
	},
	serve: {
		port: 9000,
		open: true,
		path: "/"
	}
};

module.exports = function (gulp, config) {
	config = config || {};

	config.dist = defaults(config.dist, configDefaults.dist);
	config.serve = defaults(config.serve, configDefaults.serve);

	if (!config.dist.baseurl) {
		log(c.yellow("Warning:") + " Missing dist baseurl");
		return;
	}

	var cwd = process.cwd();
	config.dist._src = config.dist.src;
	config.dist._dest = config.dist.dest;
	config.dist.src = path.join(cwd, config.dist.src);
	config.dist.dest = path.join(cwd, config.dist.dest);

	var fullDest = path.join(config.dist.dest, config.dist.baseurl);

	gulp.task("dist:clean", function () {
		return del(config.dist.dest);
	});

	gulp.task("dist:rewrite-html", function () {
		return gulp.src(config.dist.src + "/**/*.html")
			.pipe(htmlRewrite({baseurl: config.dist.baseurl, extraSrcAttrs: config.dist.extraSrcAttrs}))
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("dist:rewrite-css", function () {
		return gulp.src(config.dist.src + "/**/*.css")
			.pipe(cssRewrite({baseurl: config.dist.baseurl}))
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("dist:clone-assets", function () {
		return gulp.src([
				config.dist.src + "/**/*",
				"!" + config.dist.src + "/**/*.html",
				"!" + config.dist.src + "/**/*.css"
			], { nodir: true })
			.pipe(gulp.dest(fullDest));
	});

	gulp.task("dist:build", gulp.series("dist:clean", gulp.parallel("dist:rewrite-html", "dist:rewrite-css", "dist:clone-assets")));

	// -----
	// Serve

	gulp.task("dist:watch", function () {
		gulp.watch(config.dist._src + "/**/*", gulp.series("dist:reload"));
	});

	gulp.task("dist:browser-sync", function (done) {
		browserSync.reload();
		done();
	});
	
	gulp.task("dist:reload", gulp.series("dist:build", "dist:browser-sync"));

	gulp.task("dist:serve", function (done) {
		browserSync.init({
			startPath: path.join(config.dist.baseurl, config.serve.path),

			server: {
				baseDir: config.dist.dest
			},
			port: config.serve.port,
		});
		done();
	});


	// -------
	// Default

	gulp.task("dist", gulp.series("dist:build", "dist:serve", "dist:watch"));
};
