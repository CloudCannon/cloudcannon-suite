var webshot = require("gulp-webshot"),
	imagemin = require("gulp-imagemin"),
	fs = require("fs"),
	path = require("path"),
	defaults = require("defaults"),
	del = require("del"),
	i18nCSS = fs.readFileSync(path.join(__dirname, "i18n-overlays.css"), "utf8");

module.exports = function (gulp, config) {
	config = config || {};
	config = defaults(config, {
		dest: "reports/screenshots",
		sites: {
			dev: {
				"src": "dist/site"
			},
			i18n: {
				"src": "dist/translated_site"
			}
		},

		fast: true,
		overlays: true
	});


	function renderScreenshots(src, namespace) {
		var options = {
			dest: config.dest + "/" + namespace,
			root: src,
			screenSize: {width: 1920, height: 1080},
			shotSize: {width: 1920, height: "all"}
		};

		if (config.overlays) {
			options.customCSS = i18nCSS;
		}

		return gulp.src(src + "/**/*.html").pipe(webshot(options))
	}

	gulp.task("screenshots:clean", function () {
		return del(config.dest + "/");
	});

	for (var namespace in config.sites) {
		if (config.sites.hasOwnProperty(namespace)) {
			var options = config.sites[namespace];

			console.log(options);
			gulp.task("screenshots:" + namespace + ":clean", function () {
				return del(options.dest + "/" + namespace);
			});

			gulp.task("screenshots:" + namespace + "-render", ["screenshots:" + namespace + ":clean"], function () {
				return renderScreenshots(options.src, namespace);
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
	}
};