const Screenshotter = require('@cloudcannon/screenshot-util');
const through2Concurrent = require('through2-concurrent');
const exec = require('await-exec');

module.exports = function (screenshotter) {
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
		tags.forEach(i18ntag => {
			tagmap[i18ntag.i18n] = tagmap[i18ntag.i18n] || {pages: [], content: []};
			let formatUrl = urlPath.replace(/index\.html/, '');
			formatUrl = formatUrl.replace(/^\//, '');
			tagmap[i18ntag.i18n].pages.push({url: formatUrl, type: i18ntag.type});
			if (tagmap[i18ntag.i18n].content.indexOf(i18ntag.content) < 0) {
				tagmap[i18ntag.i18n].content.push(i18ntag.content);
			}
		});

		let img = false;//await screenshotter.takeScreenshot(page).catch(e => e);
		
		let shotDir = path.join(screenshotter.options.dest, urlPath);
		await fs.ensureDir(path.dirname(shotDir))

		if (img) {
			await fs.writeFile(shotDir.replace(/html$/, 'png'), img, (error) => {if(error)console.log(error)});
			await exec(`convert ${shotDir.replace(/html$/, 'png')} -crop 240x240 ${shotDir.replace(/html$/, 'tiles')}/tile%d.png`);
		}

		await fs.writeFile(shotDir.replace(/html$/, 'json'), JSON.stringify([...tags], null, 2));
		
		this.push(file);
		cb();
	});

	return stream;
};
