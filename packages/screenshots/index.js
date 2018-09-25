var webshot = require("gulp-webshot"),
	imagemin = require("gulp-imagemin"),
	fs = require("fs"),
	Screenshotter = require('./screenshotter.js'),
	path = require("path"),
	defaults = require("defaults"),
	gutil = require("gulp-util"),
	_ = require("underscore"),
	del = require("del"),
	webserver = require("gulp-webserver"),
	i18nCSS = fs.readFileSync(path.join(__dirname, "i18n-overlays.css"), "utf8");

module.exports = function (gulp, config) {
	config = config || {};
	config = defaults(config, {
		dest: "reports/screenshots",
		sites: {
			dev: {"src": "dist/site"},
			i18n: {"src": "dist/translated_site"},
			docs: {"src": "dist/docs"},
			dist: {"src": "dist/prod"}
		},
		fast: true,
		count: 3
	});

	function renderScreenshots(src, screenshotter, namespace, done) {
		gutil.log("Generating Screenshots from: '" + gutil.colors.blue(src) + "'");
		return gulp.src("./" + src + "/**/*.html")
			.pipe(screenshotter.start());
	}

	function registerTasks(namespace, options) {
		var options = config.sites[namespace];

		gulp.task("screenshots:" + namespace + ":clean", function () {
			return del(options.dest + "/" + namespace);
		});

		var screenshotter = new Screenshotter({
			dest: config.dest + "/" + namespace,
			root: options.src,
			screenSize: {width: 1920, height: 1080},
			fullPage: true,
			count: config.count
		})

		gulp.task("screenshots:" + namespace + "-takescreens", ["screenshots:" + namespace + ":clean"], function () {
			return renderScreenshots(options.src, screenshotter, namespace);
		});

		gulp.task("screenshots:" + namespace + "-render", ["screenshots:" + namespace + "-takescreens"], function (done) {
			screenshotter.shutdown(done);
		});

		gulp.task("screenshots:" + namespace + "-tool", ["screenshots:" + namespace + "-takescreens"], function (done) {
			screenshotter.shutdown(done);
			return gulp.src(config.dest + "/" + namespace)
			.pipe(webserver({open: true}));
		});


		gulp.task("screenshots:" + namespace, ["screenshots:" + namespace + "-render"], function () {
			if (config.fast) {
				return;
			}

			return gulp.src(options.src + "/**/*").pipe(imagemin({
				verbose: true
			}));
		});
	}

	gulp.task("screenshots:clean", function () {
		return del(config.dest + "/");
	});

	for (var namespace in config.sites) {
		if (config.sites.hasOwnProperty(namespace)) {
			registerTasks(namespace, config.sites[namespace]);
		}
	}
};
