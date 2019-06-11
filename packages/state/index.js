var del = require("del"),
	path = require("path"),
	defaults = require("defaults"),
	fs = require("fs-extra"),
	browserSync = require('browser-sync').create(),
	dependencies = require("./plugins/dependencies"),
	dependents = require("./plugins/dependents");

var configDefaults = {
	state: {
		src: "dist/site",
		dest: "reports/state"
	},
	serve: {
		port: 9001
	},
	options: {
		ignore_data_urls: true,
		ignore_mailto: true,
		ignore_cc_editor_links: true,
		scan_js: true,
		extensionless_urls: false
	}
};

module.exports = function (gulp, config) {
	let dependenciesFilename = "/dependencies.json";
	let dependentsFilename = "/dependents.json";
	let listFilename = "/filenames.txt";

	config = config || {};

	config.state = defaults(config.state, configDefaults.state);
	config.serve = defaults(config.serve, configDefaults.serve);
	config.options = defaults(config.options, configDefaults.options);

	var cwd = process.cwd();
	config.state._src = config.state.src;
	config.state._dest = config.state.dest;
	config.state.src = path.join(cwd, config.state.src);
	config.state.dest = path.join(cwd, config.state.dest);

	// -----
	// Graph

	var dependenciesGraph = {};
	var dependentsGraph = {};
	var filenameList = [];

	gulp.task("state:find-unused", async function () {
		var data = await fs.readFile(path.join(config.state.dest, dependenciesFilename), "utf8");
		data = JSON.parse(data);
		console.log("Unreferenced files:")
		return gulp.src([config.state.src + "/**/*"], { nodir: true })
			.on("data", function (file) {
				var filePath = file.path.substring(file.base.length);

				for (var key in data) {
					var entry = data[key];
					for (var subkey in entry) {
						if (entry[subkey].includes(filePath)
							|| entry[subkey].includes(filePath)
							|| entry[subkey].includes(filePath)) {
								return;
						}
					}
					
				}
				console.log("  ", filePath);
			});
	});

	gulp.task("state:get-filename-list", function (done) {
		if (!config.options.scan_js) {
			console.log("Skipping - filename list is only needed for scanning JavaScript. Enable scan_js if you want this.")
			return done();
		}

		gulp.src([config.state.src + "/**/*"], { nodir: true })
			.on("data", function (file) {
				filenameList.push(file.path.substring(file.base.length));
			}).on("end", function(){
				fs.ensureFile(path.join(config.state.dest, listFilename))
					.then(function() {
						fs.writeFile(path.join(config.state.dest, listFilename), filenameList.join(","), done);
					}).catch(done);
			});
	});

	gulp.task("state:dependencies", function (done) {
		function runTask() {
			let srcPath = config.state.src + "/**/*";
			gulp.src([srcPath + ".html", srcPath + ".css", srcPath + ".js"], { nodir: true })
				.pipe(dependencies(config.options, filenameList))
				.on("data", function (data) {
					dependenciesGraph[data[0]] = data[1];
				}).on("end", function () {
					fs.ensureFile(path.join(config.state.dest, dependenciesFilename)).then(function() {
						fs.writeFile(path.join(config.state.dest, dependenciesFilename), JSON.stringify(dependenciesGraph, null, "\t"), done);
					}).catch(done);
				});	
		}


		if (config.options.scan_js && (!filenameList || filenameList.length === 0)) {
			console.log("Filename List not found, loading from file...");
			fs.readFile(path.join(config.state.dest, listFilename), "utf8", function (err, data) {
				if (err) {
					console.log("❌ Failed");
					return done(err);
				}
				
				console.log("✅ Done");
				filenameList = data.split(",");
				runTask();
			});
		} else {
			runTask();
		}
	});

	gulp.task("state:dependents", function (done) {
		function runTask() {
			gulp.src([config.state.src + "/**/*"], { nodir: true})
				.pipe(dependents(config.options, dependenciesGraph))
				.on("data", function (data) {
					dependentsGraph[data[0]] = data[1];
				}).on("end", function () {
					fs.ensureFile(path.join(config.state.dest, dependentsFilename)).then(function() {
						fs.writeFile(path.join(config.state.dest, dependentsFilename), JSON.stringify(dependentsGraph, null, "\t"), done);
					}).catch(done);
				});
		}

		if (!dependenciesGraph || Object.keys(dependenciesGraph).length === 0) {
			console.log("Dependencies not found, loading from file...");
			fs.readFile(path.join(config.state.dest, dependenciesFilename), "utf8", function (err, data) {
				if (err) {
					console.log("❌ Failed");
					return done(err);
				}
				
				console.log("✅ Done");
				dependenciesGraph = JSON.parse(data);
				runTask();
			});
		} else {
			runTask();
		}
	});

	// -----
	// Serve

	gulp.task("state:add-interface", function (done) {
		fs.copyFile(path.join(__dirname, "./index.html"), path.join(config.state.dest, "/index.html"), done);
	});
	
	gulp.task("state:serve", function (done) {
		browserSync.init({
			server: {
				baseDir: config.state.dest
			},
			port: config.serve.port,
		});
		done();
	});

	// -------
	// Default
	gulp.task("state:clean", async function () {
		await del(config.state.dest);
	});

	gulp.task("state:build-tree", gulp.series("state:get-filename-list", "state:dependencies", "state:dependents"));
	gulp.task("state:build", gulp.series("state:build-tree", "state:add-interface"));
	gulp.task("state", gulp.series("state:build", "state:serve"));
};
