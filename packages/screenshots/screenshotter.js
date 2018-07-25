const through = require('through2');
const through2Concurrent = require('through2-concurrent');
const PluginError = require('plugin-error');
const puppeteer = require('puppeteer');
const util = require('util')
const path = require('path')
const fs = require('fs-extra')
const serve = require('./serve.js')
const gutil = require("gulp-util")
const PLUGIN_NAME = 'cc-screenshotter';
const timeout = ms => new Promise(res => setTimeout(res, ms))

function Screenshotter(options) {
  this.tagmap = {};
  this.options = options;
  this.browser;
}

Screenshotter.prototype.puppetLaunched = function () {
  return !!this.browser;
};

Screenshotter.prototype.puppetCheck = async function () {
  while (!this.puppetLaunched()) {
    await timeout(500);
  }
  return;
};

Screenshotter.prototype.start = function () {
  let screenshotter = this;
  puppeteer.launch().then(async pbrowser => {
    screenshotter.browser = pbrowser;
  });

  serve.start();
  const stream = through2Concurrent.obj({maxConcurrency: 10}, async function(file, enc, cb) {
    await screenshotter.puppetCheck();
    await screenshotter.takeScreenshot(file.path, screenshotter.options);

    this.push(file);
    cb();
  });

  return stream;
};

Screenshotter.prototype.shutdown = async function (done) {
  console.log("Writing map.json...");
  await fs.writeFile(path.join(this.options.dest, "map.json"), JSON.stringify(this.tagmap, null, 2));

  console.log("Writing index.html...");
  await fs.createReadStream(path.join(__dirname, 'index.html')).pipe(fs.createWriteStream(path.join(this.options.dest, "index.html")));

  console.log("Waiting 1 second.");
  await timeout(1000);
  console.log("Closing browser...");
  this.browser.close();
  console.log("Done.");
  console.log("Ending server.");
  serve.end();
  console.log("Done.");
  done();
};

Screenshotter.prototype.takeScreenshot = async function (filePath) {
  let screenshotter = this;
  let srcPath = path.join(process.cwd(), screenshotter.options.root);
  let urlPath = path.relative(srcPath, filePath);

  console.log("--------");
  console.log(gutil.colors.bgCyan(gutil.colors.black(`Opening ${urlPath}`)))
  console.log("--------");

  await this.browser.newPage().then(async page => {
    await page.emulateMedia('screen');
    await page.setViewport({width: screenshotter.options.screenSize.width, height: screenshotter.options.screenSize.height});
    await page.goto(`http://localhost:9845/${urlPath}`);
    await timeout(1000);
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
    });

    tags.forEach(i18ntag => {
      screenshotter.tagmap[i18ntag.i18n] = screenshotter.tagmap[i18ntag.i18n] || {pages: [], content: []};
      let formatUrl = urlPath.replace(/index\.html/, '');
      formatUrl = formatUrl.replace(/^\//, '');
      screenshotter.tagmap[i18ntag.i18n].pages.push({url: formatUrl, type: i18ntag.type});
      if (screenshotter.tagmap[i18ntag.i18n].content.indexOf(i18ntag.content) < 0) {
        screenshotter.tagmap[i18ntag.i18n].content.push(i18ntag.content);
      }
    });

    let shotDir = path.join(screenshotter.options.dest, urlPath);
    await fs.ensureDir(path.dirname(shotDir))
    await page.screenshot({path: shotDir.replace(/html$/, 'png'), fullPage: screenshotter.options.fullPage});
    await fs.writeFile(shotDir.replace(/html$/, 'json'), JSON.stringify([...tags], null, 2));

    console.log("--------");
    console.log(gutil.colors.bgGreen(gutil.colors.black(`Saved ${shotDir.replace(/html$/, '[png,json]')}`)));
    console.log("--------");
    await page.close();
  })
}


module.exports = Screenshotter;
