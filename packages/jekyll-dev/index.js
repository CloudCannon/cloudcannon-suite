var c = require("ansi-colors"),
	path = require("path"),
	fs = require("fs"),
	log = require("fancy-log"),
	yamlParser = require("js-yaml"),
	defaults = require("defaults"),
	browserSync = require('browser-sync').create(),
	childProcess = require("child_process");

var configDefaults = {
	namespace: "dev",
	jekyll: {
		src: "src",
		dest: "dist/site",
	},
	flags: [],
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

function fetchGitignores(gitignorePath, callback) {
	fs.readFile(gitignorePath, function (err, ignoreContents) {
		var ignores = {};
		if (err) {
			log(c.yellow("! loading `" + gitignorePath + "` failed"));
		} else {
			var lines = ignoreContents.toString("utf8").split("\n");

			for (var i = 0; i < lines.length; i++) {
				var key = lines[i].trim();
				if (key) {
					ignores[key] = true;
				}
			}
		}

		callback(err, ignores);
	});
}

function folderIsIgnored(basePath, item, ignores) {
	if (ignores[item]) {
		return true;
	}

	var itemPath = path.join(basePath, item);
	for (var ignore in ignores) {
		if (ignores.hasOwnProperty(ignore)) {
			var ignorePath = path.join(basePath, ignore);
			var relativePath = path.relative(ignorePath, itemPath).trim();
			var isSubdir = !!relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);

			if (!relativePath || isSubdir) {
				return true;
			}
		}
	}

	return false;
}

module.exports = function (gulp, config) {
	config = config || {};

	config.jekyll = defaults(config.jekyll, configDefaults.jekyll);
	config.serve = defaults(config.serve, configDefaults.serve);
	config.namespace = config.namespace || configDefaults.namespace;
	config.tasks = config.tasks || configDefaults.tasks;
	config.flags = config.flags || configDefaults.flags;

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
		log(c.blue("$") + " bundle " + commands.join(" "));
		var output = "";
		function readOutput(data) {
			if (trackOutput) {
				output += data;
			} else {
				process.stdout.write(c.grey(data.toString("utf8")));
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
		config.flags.forEach(function(flag) {
			commands.push(flag);
		});

		return runBundleCommand(commands, false, done);
	});
	
	gulp.task(nspc + ":install", function (done) {
		return runBundleCommand(["install", "--path", "../vendor/bundle"], false, done);
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
				gulp.watch(config.tasks[taskName].watch, {delay: 500}, gulp.series(nspc + ":" + taskName));

				config.tasks[taskName].watch.forEach(function (glob) {
					jekyllWatchFiles.push("!" + glob);
				});
			}
		}

		function completeWatch() {
			log(c.grey("👓 watching: " + jekyllWatchFiles.join("\n\t")));
			gulp.watch(jekyllWatchFiles, {delay: 500}, gulp.series(nspc + ":reload"));
			log(c.grey("✔ done"));
			done();
		}

		log("Checking for local theme watch; loading jekyll config...");
		var configPath = path.join(config.jekyll.src, "/_config.yml");
		fs.readFile(configPath, function (err, contents) {
			var theme = null;

			if (err) {
				log(c.yellow("! loading `" + configPath + "` failed"));
				return completeWatch();
			} else {
				try {
					var yaml = yamlParser.safeLoad(contents.toString('utf8'));

					theme = yaml.theme;
				} catch (e) {
					log(c.yellow("! parsing config failed"));
					log(e);
					return completeWatch();
				}
			}

			if (!theme) {
				log(c.grey("✔ no theme found, moving along"));
				return completeWatch();
			}

			log("Checking for local theme repo...");
			runBundleCommand(["config", "local." + theme], true, function(err, output) {
				if (err) {
					log(c.yellow("! running `bundle config` failed"));
					return completeWatch();
				}

				var themePath = parseBundleConfigPath(output);

				if (themePath) {
					log(c.green("✔ found local theme at `" + themePath + "`, reading .gitignore"));
					var baseThemeWatch = path.relative(cwd, themePath);

					var gitignorePath = path.join(themePath, ".gitignore");
					fetchGitignores(gitignorePath, function (err, ignores) {
						if (err) {
							log(c.yellow("! loading `" + gitignorePath + "` failed. If the watch crashes, adding one will fix this."));
							jekyllWatchFiles.push(baseThemeWatch + "/**/*");
							return completeWatch();
						}

						jekyllWatchFiles.push(baseThemeWatch + "/*");
						ignores[".git"] = true;
						for (var subpath in ignores) {
							if (ignores.hasOwnProperty(subpath)) {
								jekyllWatchFiles.push("!" + path.relative(cwd, path.join(baseThemeWatch, subpath)));
							}
						}

						fs.readdir(baseThemeWatch, function (err, files) {
							files.forEach(async function (item) {
								try {
									var itemPath = path.join(baseThemeWatch, item);
									var stat = fs.lstatSync(itemPath);
									if(stat.isDirectory() && !folderIsIgnored(baseThemeWatch, item, ignores)) {
										jekyllWatchFiles.push(path.relative(cwd, path.join(itemPath)) + "/**/*");
									}
								} catch(err) {
									console.error(err);
								}
							});

							return completeWatch();
						})
					});
				} else {
					// Inform user for install
					log(c.yellow("! no local theme installed. Consider running:"));
					log(c.blue("bundle config local." + theme + " ~/path/to/project"));
					return completeWatch();
				}

			});

		});
	});

	gulp.task(nspc + ":browser-sync", function (done) {
		browserSync.reload();
		done();
	});
	
	gulp.task(nspc + ":reload", gulp.series(nspc + ":build", nspc + ":browser-sync"));
	gulp.task(nspc + ":serve", function (done) {
		browserSync.init({
			server: {
				baseDir: config.jekyll.dest
			},
			port: config.serve.port,
		});
		done();
	});

	// -------
	// Default
	if (customTasks.length > 0) {
		gulp.task(npsc, gulp.series(customTasks, nspc + ":build", gulp.parallel(nspc + ":watch", nspc + ":serve")));
	} else {
		gulp.task(nspc, gulp.series(nspc + ":build", gulp.parallel(nspc + ":watch", nspc + ":serve")));
	}
};
