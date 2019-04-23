const through = require("through2").obj,
	//exec = require('await-exec'),
	log = require("fancy-log"),
	c = require('ansi-colors'),
	fs = require('fs-extra'),
	path = require("path"),
	timeout = ms => new Promise(res => setTimeout(res, ms)),
	merge = require("merge-img");

module.exports = function (screenshotter, tagmap) {
	return through(async function(file, enc, cb) {
		log(`Launching browser`)
		await screenshotter.launchBrowser();

		log(`Launching server`)
		let serverUrl = await screenshotter.launchServer();
		let srcPath = path.join(process.cwd(), screenshotter.options.path);
		let urlPath = path.relative(srcPath, file.path);

		log(`Launching page`)
		let page = await screenshotter.loadPage(serverUrl, urlPath, {
			name: "desktop",
			width: 1920,
			height: 1080
		});

		if (!page) {
			log(`No page, shutting down browser and server`);
			await screenshotter.shutdownServer();
			await screenshotter.shutdownBrowser();
			return cb();
		}

		log(`Finding data-i18n tags`)
		const tags = await page.evaluate(() => {
			const i18ntags = Array.from(document.querySelectorAll('[data-i18n]'))
			return i18ntags.map(i18ntag => {
				let tagObj = {};
				tagObj.content = i18ntag.innerHTML;
				tagObj.type = i18ntag.tagName.toLowerCase();
				tagObj.i18n = i18ntag.getAttribute('data-i18n');

				let range = document.createRange();
				range.selectNodeContents(i18ntag);
				let rect = range.getBoundingClientRect();
				if (!rect) {
					rect = i18ntag.getBoundingClientRect();
				}

				tagObj.top = rect.top;
				tagObj.right = rect.right;
				tagObj.bottom = rect.bottom;
				tagObj.left = rect.left;

				return tagObj;
			});
		}).catch(e => console.error(e));

		log(`Formatting data-i18n tags`)
		tags.forEach(i18ntag => {
			tagmap[i18ntag.i18n] = tagmap[i18ntag.i18n] || {pages: [], content: []};
			let formatUrl = urlPath.replace(/index\.html/, '');
			formatUrl = formatUrl.replace(/^\//, '');
			tagmap[i18ntag.i18n].pages.push({url: formatUrl, type: i18ntag.type});
			if (tagmap[i18ntag.i18n].content.indexOf(i18ntag.content) < 0) {
				tagmap[i18ntag.i18n].content.push(i18ntag.content);
			}
		});

		log(`Taking screenshot`);

		if (screenshotter.options.delay) {
			log(`Waiting ${screenshotter.options.delay}ms`);
			await timeout(screenshotter.options.delay);
		}
	
		let screenshotOptions = {encoding: (screenshotter.options.base64 ? "base64" : "binary")};
	
		log(`Finding page size`);
		const { width, height } = await page.evaluate(() => {
			const body = document.querySelector('body');
			const boundingBox = body.getBoundingClientRect();
			return {width: boundingBox.width, height: boundingBox.height};
		}).catch(e => log.error(e));

		let segmentHeight = 4000;
		let numSegments = Math.ceil(height / segmentHeight);
	
		screenshotOptions.clip = {
			x: 0,
			y: 0,
			width,
			height: segmentHeight
		};

		log(`Taking screenshot in ${numSegments} parts, at ${width}px by ${height}px total`);
		let screenshot = await page.screenshot(screenshotOptions);
		for (let n = 1; n < numSegments; n++) {
			screenshotOptions.clip.y = Math.min(segmentHeight * n, height);
			screenshotOptions.clip.height = Math.min(screenshotOptions.clip.height, height - screenshotOptions.clip.y);
			const screenshotBottom = await page.screenshot(screenshotOptions);
			screenshot = await merge([screenshot, screenshotBottom], { direction: true });
		}
	
		log(c.greenBright(`Screenshot completed ${page.url()} ✓`));
	
		log(`Page closing`);
		await page.close();
		log(`Page closed`);

		log(`Shutting down browser and server`);
		await screenshotter.shutdownServer();
		await screenshotter.shutdownBrowser();

		log(`Ensuring directory`);
		let shotDir = path.join(screenshotter.options.dest, urlPath);
		await fs.ensureDir(path.dirname(shotDir));

		if (screenshot) {
			log(`Outputting image`);
			if (numSegments > 1) {
				await screenshot.write(shotDir.replace(/html$/, 'png'), (error) => {
					if (error)console.log(error);
				});
			} else {
				await fs.writeFile(shotDir.replace(/html$/, 'png'), screenshot, (error) => {
					if(error)console.log(error);
				});
			}
			
			//await fs.ensureDir(shotDir.replace(/html$/, 'tiles/'));
			//await exec(`convert ${shotDir.replace(/html$/, 'png')} -crop 240x240 ${shotDir.replace(/html$/, 'tiles')}/tile%d.png`);
		}

		log(`Outputting json`);
		await fs.writeFile(shotDir.replace(/html$/, 'json'), JSON.stringify([...tags], null, 2));

		this.push(file);
		cb();
	});
};