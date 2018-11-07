var imagemin = require("gulp-imagemin"),
	fs = require('fs-extra'),
	Screenshotter = require('@cloudcannon/screenshot-util'),
	through = require('through2');
	through2Concurrent = require('through2-concurrent');
	path = require("path"),
	defaults = require("defaults"),
	gutil = require("gulp-util"),
	_ = require("underscore"),
	del = require("del"),
	webserver = require("gulp-webserver"),
	i18nCSS = fs.readFileSync(path.join(__dirname, "i18n-overlays.css"), "utf8");

const tagmap = {};
const timeout = ms => new Promise(res => setTimeout(res, ms));

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
			.pipe(screenshotStream(screenshotter));
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

const screenshotStream = function (screenshotter) {
	screenshotter.launch();
	screenshotter.serve();

	const stream = through2Concurrent.obj({maxConcurrency: 10}, async function(file, enc, cb) {
		await screenshotter.puppetCheck();
		let serverUrl = await screenshotter.serve();
		let srcPath = path.join(process.cwd(), screenshotter.options.path);
		let urlPath = path.relative(srcPath, file.path);
		let page = await screenshotter.loadPage(serverUrl, urlPath, {
			name: "desktop",
			width: 1920,
			height: 1080
		});

		if (!page) {
			return cb();
		}

		const tags = await page.evaluate(() => {
			const i18ntags = Array.from(document.querySelectorAll('[data-i18n]'))
			return i18ntags.map(i18ntag => ({
				content: i18ntag.innerHTML,
				left: i18ntag.getBoundingClientRect().left,
				top: i18ntag.getBoundingClientRect().top,
				right: i18ntag.getBoundingClientRect().right,
				bottom: i18ntag.getBoundingClientRect().bottom,
				i18n: i18ntag.getAttribute('data-i18n'),
				type: i18ntag.tagName.toLowerCase()
			}))
		}).catch(e => e);
		tags.forEach(i18ntag => {
			tagmap[i18ntag.i18n] = tagmap[i18ntag.i18n] || {pages: [], content: []};
			let formatUrl = urlPath.replace(/index\.html/, '');
			formatUrl = formatUrl.replace(/^\//, '');
			tagmap[i18ntag.i18n].pages.push({url: formatUrl, type: i18ntag.type});
			if (tagmap[i18ntag.i18n].content.indexOf(i18ntag.content) < 0) {
				tagmap[i18ntag.i18n].content.push(i18ntag.content);
			}
		});

		let img = await screenshotter.takeScreenshot(page).catch(e => e);

		if (img) {
			let shotDir = path.join(screenshotter.options.dest, urlPath);
			await fs.ensureDir(path.dirname(shotDir))
			await fs.writeFile(shotDir.replace(/html$/, 'png'), img, (error) => {if(error)console.log(error)});
			await fs.writeFile(shotDir.replace(/html$/, 'json'), JSON.stringify([...tags], null, 2));
		}

		this.push(file);
		cb();
	});

	return stream;
};
