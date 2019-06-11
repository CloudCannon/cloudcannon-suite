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
		dest: "dist/state",
		report: "reports/state",
		baseurl: ""
	},
	serve: {
		port: 9001
	},
	options: {
		ignore_data_urls: true,
		ignore_mailto: true,
		ignore_cc_editor_links: true,
		scan_js: true
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

	var fullDest = path.join(config.state.dest, config.state.baseurl);

	// -----
	// Graph

	var dependenciesGraph = {};
	var dependentsGraph = {};
	var filenameList = [];

	gulp.task("state:find-unused", function () {
		var data = fs.readFileSync(config.state.report + dependenciesFilename, "utf8");
		data = JSON.parse(data);
		console.log("Unreferenced files:")
		return gulp.src([config.state.src + "/**/*"], { nodir: true })
			.on("data", function (file) {
				var filePath = file.path.substring(file.base.length);
				filePath = filePath.replace(/\/index.html?/i, "/");
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
			done();
		} else {
			gulp.src([config.state.src + "/**/*"], { nodir: true })
				.on("data", function (file) {
					filenameList.push(file.path.substring(file.base.length).replace(/\/index.html?/i, "/"));
				}).on("end", function(){
					fs.ensureFile(config.state.report + listFilename)
						.then(function() {
							fs.writeFileSync(config.state.report + listFilename, filenameList.join(","));
							done();
						}).catch(function(err) {
							console.log(err);
							done();
						});
				});
		}
	});

	gulp.task("state:dependencies", function (done) {
		if (!filenameList || filenameList.length === 0) {
			var data = fs.readFileSync(config.state.report + listFilename, "utf8");
			filenameList = data.split(",");
		}
		let srcPath = config.state.src + "/**/*";
		gulp.src(
			[srcPath + ".html", srcPath + ".css", srcPath + ".js"], 
			{ nodir: true })
		.pipe(dependencies(config.options, filenameList))
		.on("data", function (data) {
			dependenciesGraph[data[0]] = data[1];
		}).on("end", function () {
			fs.ensureFile(config.state.report + dependenciesFilename)
				.then(function() {
					fs.writeFileSync(config.state.report + dependenciesFilename, JSON.stringify(dependenciesGraph, null, "\t"));
					done();
				}).catch(function(err) {
					console.log(err);
					done();
				});
		});
	});

	gulp.task("state:dependents", async function (done) {
		if (!dependenciesGraph || Object.keys(dependenciesGraph).length === 0) {
			let data = await fs.readFileSync(config.state.report + dependenciesFilename, "utf8");
			dependenciesGraph = JSON.parse(data);
		}
		gulp.src([config.state.src + "/**/*"], { nodir: true})
			.pipe(dependents(config.options, dependenciesGraph))
			.on("data", function (data) {
				dependentsGraph[data[0]] = data[1];
			}).on("end", function () {
				fs.ensureFile(config.state.report + dependentsFilename)
				.then(function() {
					fs.writeFileSync(config.state.report + dependentsFilename, JSON.stringify(dependentsGraph, null, "\t"));
					done();
				}).catch(function(err) {
					console.log(err);
					done();
				});
			});
	});

	// -----
	// Serve

	gulp.task("state:clean", function () {
		return del(fullDest);
	});

	gulp.task("state:build", async function (done) {
		try {
			await fs.ensureDir(fullDest);
			await fs.copyFile(path.join(config.state.report, dependenciesFilename), path.join(fullDest, dependenciesFilename));
			await fs.copyFile(path.join(config.state.report, dependentsFilename), path.join(fullDest, dependentsFilename));
			await fs.copyFile(path.join(__dirname, "./index.html"), path.join(fullDest, "/index.html"));
		} catch (err) {
			console.log(err);
		}
		done();
	});
	
	gulp.task("state:serve", function (done) {
		browserSync.init({
			server: {
				baseDir: fullDest
			},
			port: config.serve.port,
		});
		done();
	});

	// -------
	// Default

	gulp.task("state", gulp.series("state:get-filename-list", "state:dependencies", "state:dependents", "state:clean", "state:build", "state:serve"));
};
