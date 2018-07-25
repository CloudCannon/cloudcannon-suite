const through = require('through2');
const through2Concurrent = require('through2-concurrent');
const PluginError = require('plugin-error');
const puppeteer = require('puppeteer');
const util = require('util')
const path = require('path')
const fs = require('fs-extra')
const serve = require('./serve.js')
const gutil = require("gulp-util")

let tagmap = {};

const PLUGIN_NAME = 'cc-screenshotter';
let browser,
    puppetLaunched = false;

const timeout = ms => new Promise(res => setTimeout(res, ms))

function screenshotWorker(options) {
  puppeteer.launch().then(async pbrowser => {
    puppetLaunched = true;
    browser = pbrowser;
  });
  serve.start();
  const stream = through2Concurrent.obj({maxConcurrency: 10}, async function(file, enc, cb) {
    await puppetCheck()
    await shotter(file.path, options)
    this.push(file);
    cb();
  });
  return stream;
}

async function shotter(filePath, options) {
  let srcPath = path.join(process.cwd(), options.root)
  let urlPath = path.relative(srcPath, filePath)
  console.log("--------");
  console.log(gutil.colors.bgCyan(gutil.colors.black(`Opening ${urlPath}`)))
  console.log("--------");
  await browser.newPage().then(async page => {
    await page.emulateMedia('screen');
    await page.setViewport({width: options.screenSize.width, height: options.screenSize.height});
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
      tagmap[i18ntag.i18n] = tagmap[i18ntag.i18n] || {pages: [], content: []};
      let formatUrl = urlPath.replace(/index\.html/, '');
      tagmap[i18ntag.i18n].pages.push({url: formatUrl, type: i18ntag.type});
      if (tagmap[i18ntag.i18n].content.indexOf(i18ntag.content) < 0) {
        tagmap[i18ntag.i18n].content.push(i18ntag.content);
      }
    });
    let shotDir = path.join(options.dest, urlPath);
    await fs.ensureDir(path.dirname(shotDir))
    await page.screenshot({path: shotDir.replace(/html$/, 'png'), fullPage: options.fullPage});
    await fs.writeFile(shotDir.replace(/html$/, 'json'), JSON.stringify([...tags], null, 2));
    console.log("--------");
    console.log(gutil.colors.bgGreen(gutil.colors.black(`Saved ${shotDir.replace(/html$/, '[png,json]')}`)));
    console.log("--------");
    await page.close();
  })
}

async function puppetCheck() {
  while (!puppetLaunched) {
    await timeout(500)
  }
  return
}

async function shutdown(options) {
  console.log("Screenshots completed, closing up shop.");
  await fs.writeFile(path.join(options.dest, "map.json"), JSON.stringify(tagmap, null, 2));
  await fs.unlink(path.join(options.dest, "index.html"), function(err){
    if(err) {
    }
  });
  await fs.createReadStream(path.join(__dirname, 'index.html')).pipe(fs.createWriteStream(path.join(options.dest, "index.html")));
  setTimeout(function() {
    browser.close();
    serve.end();
  }, 1000);
}

module.exports = {
  worker: screenshotWorker,
  shutdown: shutdown
};