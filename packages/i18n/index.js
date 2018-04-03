var async = require("async"),
	fs = require("fs"),
	del = require("del"),
	gutil = require("gulp-util"),
	path = require("path"),
	defaults = require("defaults"),
	webserver = require("gulp-webserver"),
	props2json = require("gulp-props2json"),
	i18n = require("./plugins/i18n"),
	rename = require("gulp-rename"),
	gulpSequence = require("gulp-sequence");

var configDefaults = {
	i18n: {
		src: "dist/site",
		dest: "dist/translated_site",

		default_language: "en",
		locale_src: "i18n/locales",
		generated_locale_dest: "i18n",

		legacy_path: "_locales"
	},
	serve: {
		port: 8000,
		open: true,
		path: "/"
	}
};

module.exports = function (gulp, config) {
	config = config || {};

	config.i18n = defaults(config.i18n, configDefaults.i18n);
	config.serve = defaults(config.serve, configDefaults.serve);

	var cwd = process.cwd();
	config.i18n._src = config.i18n.src;
	config.i18n._dest = config.i18n.dest;
	config.i18n._locale_src = config.i18n.locale_src;
	config.i18n._generated_locale_dest = config.i18n.generated_locale_dest;
	config.i18n._legacy_path = config.i18n.legacy_path;

	config.i18n.src = path.join(cwd, config.i18n.src);
	config.i18n.dest = path.join(cwd, config.i18n.dest);
	config.i18n.locale_src = path.join(cwd, config.i18n.locale_src);
	config.i18n.generated_locale_dest = path.join(cwd, config.i18n.generated_locale_dest);
	config.i18n.legacy_path = path.join(cwd, config.i18n.legacy_path);

	// -------
	// Legacy

	// Transfers properties files from the old CloudCannon format
	// to the new i18n folder structure
	gulp.task("i18n:legacy-transfer",  function (done) {
		gutil.log(gutil.colors.green("Transferring files") + " from "
			+ gutil.colors.blue(config.i18n.legacy_path + "/*.properties")
			+ " to "
			+ gutil.colors.blue(config.i18n.locale_src));

		return gulp.src(config.i18n.legacy_path + "/*.properties")
			.pipe(props2json({ minify: false }))
			.pipe(gulp.dest(config.i18n.locale_src));
	});

	// ---------------
	// Generate Source

	gulp.task("i18n:generate",  function (done) {
		gutil.log(gutil.colors.green("Generating source locale") + " from "
			+ gutil.colors.blue(config.i18n._src)
			+ " to "
			+ gutil.colors.blue(config.i18n._generated_locale_dest));

		return gulp.src(config.i18n._src + "/**/*.html")
			.pipe(i18n.generate({}))
			.pipe(gulp.dest(config.i18n._generated_locale_dest));
	});


	// --------------
	// Translate Site

	var locales, localeNames; // holds locales between stages

	gulp.task("i18n:load-locales", function (done) {
		fs.readdir(config.i18n.locale_src, function(err, files) {
			if (err) {
				console.log(err);
				return done(err);
			}

			locales = {};
			locales[config.i18n.default_language] = null;
			async.each(files, function (filename, next) {
				if (!/\.json$/.test(filename)) {
					return next();
				}

				fs.readFile(path.join(config.i18n.locale_src, filename), function read(err, data) {
					if (err) {
						console.log(err);
						return next(err);
					}

					var key = filename.replace(/\.json$/, "");
					try {
						locales[key] = JSON.parse(data);
					} catch (e) {
						gutil.log(gutil.colors.red("Malformed JSON") + " from "
							+ gutil.colors.blue(config.i18n.locale_src + "/" + filename) + ": " + e.message);
					}

					for (var localeKey in locales[key]) {
						if (locales[key].hasOwnProperty(localeKey)) {
							locales[key][localeKey] = {
								translation: locales[key][localeKey],
								count: 0
							};
						}
					}
					next();
				});
			}, function (err) {
				localeNames = Object.keys(locales);
				done(err);
			});
		});
	});

	gulp.task("i18n:clean", function () {
		return del(config.i18n.dest);
	});

	gulp.task("i18n:clone-assets",  function () {
		return gulp.src([config.i18n.src + "/**/*", "!" + config.i18n.src + "/**/*.html"], { nodir: true })
			.pipe(gulp.dest(config.i18n.dest));
	});

	gulp.task("i18n:translate-html-pages", function (done) {
		async.each(localeNames, function (targetLocale, next) {
			return gulp.src(config.i18n.src + "/**/*.html")
				.pipe(i18n.translate({
					targetLocale: targetLocale,
					localeNames: localeNames,
					locales: locales
				})).pipe(rename(function (path) {
					path.dirname = path.dirname.replace(/^\/+/, "") || ".";
				})).pipe(gulp.dest(path.join(config.i18n.dest, targetLocale)))
				.on('end', next);
		}, done);
	});

	gulp.task("i18n:clone-prelocalised-html-pages", function (done) {
		async.each(localeNames, function (targetLocale, next) {
			return gulp.src(config.i18n.src + "/" + targetLocale + "/**/*.html")
				.pipe(gulp.dest(config.i18n.dest + "/" + targetLocale))
				.on('end', next);
		}, done);
	});

	gulp.task("i18n:build", gulpSequence(
		"i18n:clean",
		["i18n:load-locales", "i18n:clone-assets"],
		"i18n:translate-html-pages",
		"i18n:clone-prelocalised-html-pages"
	));

	// -----
	// Serve

	gulp.task("i18n:watch", function () {
		gulp.watch(config.i18n._locale_src + "/**/*", ["i18n:build"]);
		gulp.watch(config.i18n._src + "/**/*", ["i18n:build", "i18n:generate"]);
	});

	gulp.task("i18n:serve", ["i18n:build"], function() {
		return gulp.src(config.i18n.dest)
			.pipe(webserver({
				open: path.join(config.i18n.default_language) + config.serve.path,
				port: config.serve.port
			}));
	});


	// -------
	// Default

	gulp.task("i18n", gulpSequence("i18n:serve", "i18n:watch"));

	gulp.task("i18n:kickoff", gulpSequence("dev:build", ["i18n:generate", "screenshots:dev"]));
};