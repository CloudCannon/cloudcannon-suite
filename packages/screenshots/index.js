var imagemin = require("gulp-imagemin"),
	fs = require('fs-extra'),
	path = require("path"),
	defaults = require("defaults"),
	gutil = require("gulp-util"),
	_ = require("underscore"),
	del = require("del"),
	screenshotStream = require("./plugins/screenshotStream"),
	webserver = require("gulp-webserver"),
	Screenshotter = require('@cloudcannon/screenshot-util');

require('events').EventEmitter.prototype._maxListeners = 100;

const tagmap = {};	

module.exports = async function (gulp, config) {
	config = config || {};
	config = defaults(config, {
		dest: "reports/screenshots",
		sites: {
			dev: {"src": "dist/site", "portInc": 1},
			i18n: {"src": "dist/translated_site", "portInc": 2},
			docs: {"src": "dist/docs", "portInc": 3},
			dist: {"src": "dist/prod", "portInc": 4}
		},
		fast: true,
		count: 3
	});

	function renderScreenshots(src, screenshotter, namespace, done) {
		gutil.log("Generating Screenshots from: '" + gutil.colors.blue(src) + "'");
		return gulp.src("./" + src + "/**/*.html")
			.pipe(screenshotStream(screenshotter,tagmap));
	}

	function registerTasks(namespace, options) {
		var options = config.sites[namespace];

		gulp.task("screenshots:" + namespace + ":clean", function () {
			return del(options.dest + "/" + namespace);
		});

		var screenshotter = new Screenshotter({
			dest: config.dest + "/" + namespace,
			path: options.src,
			screenSize: {width: 1920, height: 1080},
			fullPage: true,
			count: config.count,
			docker: process.env.DOCKER_SCREENSHOTS || false,
			delay: 1000,
			portInc: options.portInc
		})

		gulp.task("screenshots:" + namespace + "-takescreens", ["screenshots:" + namespace + ":clean"], function () {
			return renderScreenshots(options.src, screenshotter, namespace);
		});

		gulp.task("screenshots:" + namespace + "-render", ["screenshots:" + namespace + "-takescreens"], async function (done) {
			console.log("Writing app index & tag map...");
			await fs.createReadStream(path.join(__dirname, 'index.html')).pipe(fs.createWriteStream(path.join(screenshotter.options.dest, "index.html")));
			await fs.writeFile(path.join(screenshotter.options.dest, "map.json"), JSON.stringify(tagmap, null, 2));
			await screenshotter.shutdownServer();
			await screenshotter.shutdownBrowser();
		});

		gulp.task("screenshots:" + namespace + "-tool", ["screenshots:" + namespace + "-takescreens"], async function (done) {
			console.log("Writing app index & tag map...");
			await fs.createReadStream(path.join(__dirname, 'index.html')).pipe(fs.createWriteStream(path.join(screenshotter.options.dest, "index.html")));
			await fs.writeFile(path.join(screenshotter.options.dest, "map.json"), JSON.stringify(tagmap, null, 2));
			await screenshotter.shutdownServer();
			await screenshotter.shutdownBrowser();
			gulp.src(config.dest + "/" + namespace)
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
