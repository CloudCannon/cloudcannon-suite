var gutil = require("gulp-util"),
	path = require("path"),
	fs = require("fs"),
	yamlParser = require("js-yaml")
	defaults = require("defaults"),
	gulpSequence = require("gulp-sequence"),
	webserver = require("gulp-webserver"),
	childProcess = require("child_process");

var configDefaults = {
	namespace: "dev",
	jekyll: {
		src: "src",
		dest: "dist/site",
	},
	tasks: [],
	serve: {
		port: 4000,
		open: true,
		path: "/"
	}
};

function parseBundleConfigPath(output) {
	output = (output || "").trim();
	if (!output) {
		return null;
	}

	var lines = output.split("\n");
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(": \"");

		if (parts.length === 2) {
			return parts[1].substring(0, parts[1].length - 1);
		}
	}

	return null;
}

module.exports = function (gulp, config) {
	config = config || {};

	config.jekyll = defaults(config.jekyll, configDefaults.jekyll);
	config.serve = defaults(config.serve, configDefaults.serve);
	config.namespace = config.namespace || configDefaults.namespace;
	config.tasks = config.tasks || configDefaults.tasks;

	var cwd = process.cwd();
	config.jekyll._src = config.jekyll.src;
	config.jekyll._dest = config.jekyll.dest;
	config.jekyll.src = path.join(cwd, config.jekyll.src);
	config.jekyll.dest = path.join(cwd, config.jekyll.dest);

	var nspc = config.namespace;

	// ------
	// Jekyll

	var JEKYLL_OPTIONS = {
		"--destination": config.jekyll.dest
	};

	function runBundleCommand(commands, trackOutput, done) {
		gutil.log(gutil.colors.blue("$") + " bundle " + commands.join(" "));
		var output = "";
		function readOutput(data) {
			if (trackOutput) {
				output += data;
			} else {
				process.stdout.write(gutil.colors.grey(data.toString("utf8")));
			}
		};

		var child = childProcess.spawn("bundle", commands, {
				cwd: config.jekyll.src
			}).on("close", function () {
				done(null, output);
			});

		child.stdout.on("data", readOutput);
		child.stderr.on("data", readOutput);

		return child;
	}

	gulp.task(nspc + ":build", function (done) {
		var commands = ["exec", "jekyll", "build"];
		for (var arg in JEKYLL_OPTIONS) {
			if (JEKYLL_OPTIONS.hasOwnProperty(arg)) {
				commands.push(arg, JEKYLL_OPTIONS[arg]);
			}
		}

		return runBundleCommand(commands, false, done);
	});

	gulp.task(nspc + ":install", function (done) {
		return runBundleCommand(["install"], false, done);
	});

	// ------------
	// Custom Tasks

	var customTasks = [];
	for (var taskName in config.tasks) {
		if (config.tasks.hasOwnProperty(taskName)) {
			gulp.task(nspc + ":" + taskName, config.tasks[taskName].task);
			customTasks.push(nspc + ":" + taskName);
		}
	}

	// -----
	// Serve

	gulp.task(nspc + ":watch", function (done) {
		var jekyllWatchFiles = [config.jekyll._src + "/**/*"];
		for (var taskName in config.tasks) {
			if (config.tasks.hasOwnProperty(taskName)) {
				gulp.watch(config.tasks[taskName].watch, [nspc + ":" + taskName]);

				config.tasks[taskName].watch.forEach(function (glob) {
					jekyllWatchFiles.push("!" + glob);
				});
			}
		}

		function completeWatch() {
			gulp.watch(jekyllWatchFiles, [nspc + ":build"]);
			done();
		}

		gutil.log("Checking for local theme watch; loading jekyll config...");
		var configPath = path.join(config.jekyll.src, "/_config.yml");
		fs.readFile(configPath, function (err, contents) {
			var theme = null;

			if (err) {
				gutil.log(gutil.colors.yellow("! loading `" + configPath + "` failed"));
				return completeWatch();
			} else {
				try {
					var yaml = yamlParser.safeLoad(contents.toString('utf8'));

					theme = yaml.theme;
				} catch (e) {
					gutil.log(gutil.colors.yellow("! parsing config failed"));
					gutil.log(e);
					return completeWatch();
				}
			}

			if (!theme) {
				gutil.log(gutil.colors.grey("✔ no theme found, moving along"));
				return completeWatch();
			}

			gutil.log("Checking for local theme repo...");
			runBundleCommand(["config", "local." + theme], true, function(err, output) {
				if (err) {
					gutil.log(gutil.colors.yellow("! running `bundle config` failed"));
					return completeWatch();
				}

				var themePath = parseBundleConfigPath(output);

				if (themePath) {
					gutil.log(gutil.colors.green("✔ found local theme at `" + themePath + "`, adding to watch dirs"));
					jekyllWatchFiles.push(themePath + "/**/*");
				} else {
					// Inform user for install
					gutil.log(gutil.colors.yellow("! no local theme installed. Consider running:"));
					gutil.log(gutil.colors.blue("bundle config local." + theme + " ~/path/to/project"));
				}

				return completeWatch();
			});

		});
	});

	gulp.task(nspc + ":serve", function() {
		var options = {
			port: config.serve.port
		};

		if (config.serve.open) {
			options.open = config.serve.path || "/";
		}

		return gulp.src(config.jekyll.dest)
			.pipe(webserver(options));
	});


	// -------
	// Default

	if (customTasks.length > 0) {
		gulp.task(nspc, gulpSequence(customTasks, nspc + ":build", [nspc + ":watch", nspc + ":serve"]));
	} else {
		gulp.task(nspc, gulpSequence(nspc + ":build", [nspc + ":watch", nspc + ":serve"]));
	}
};
