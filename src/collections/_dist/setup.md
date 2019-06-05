---
title: Setup
package: Dist
order_number: 2
subtasks:
  - name: build
    desc: Compiles HTML and CSS to be run at a baseurl
    code: gulp dist:build
  - name: serve
    desc: Runs a local webserver on the `dest` folder
    code: gulp dist:serve
  - name: watch
    desc: Watches the `src` folder and triggers builds
    code: gulp dist:watch
  - name: rewrite-html
    desc: Clones HTML files from `src` to `dist` and rewrites attributes to include baseurl (`src`, `href`, `srcset` and `meta[http-equiv='refresh']`)
    code: gulp dist:rewrite-html
  - name: rewrite-css
    desc: Clones CSS files from src to dist and rewrites urls to include baseurl
    code: gulp dist:rewrite-css
  - name: clone-assets
    desc: Clones all other files from `src` to `dist`
    code: gulp dist:clone-assets
  - name: clean
    desc: Removes all files from the `dist` folder
    code: gulp dist:clean
---
To use this package, add `suite.dist(gulp)` to your Gulpfile. You can pass in an options object to configure the baseurl. See [Configuration](/dist/configuration) for more details.

```js
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.dist(gulp, {
    "dist": {
        "baseurl":"p"
    }
});
```

### Usage

Running `gulp dist` prepends a baseurl to the entire site at `src`. HTML and CSS files are rewritten to fix references for the new folder structure. All files are cloned into the `dist` folder with the baseurl prepended. Once completed, a local webserver will be started on port 9000. Any changes to the `src` folder will trigger a rebuild of the contents.

```bash
$ gulp dist
[12:04:18] Using gulpfile ./gulpfile.js
[12:04:18] Starting 'dist'...
[12:04:18] Starting 'dist:build'...
[12:04:18] Starting 'dist:clean'...
[12:04:19] Finished 'dist:clean' after 383 ms
[12:04:19] Starting 'dist:rewrite-html'...
[12:04:19] Starting 'dist:rewrite-css'...
[12:04:19] Starting 'dist:clone-assets'...
[12:04:19] Finished 'dist:rewrite-css' after 639 ms
[12:04:26] Finished 'dist:rewrite-html' after 7.1 s
[12:04:26] Finished 'dist:clone-assets' after 7.38 s
[12:04:26] Finished 'dist:build' after 7.78 s
[12:04:26] Starting 'dist:serve'...
[12:04:26] Webserver started at http://localhost:9000
[12:04:26] Finished 'dist:serve' after 18 ms
[12:04:26] Starting 'dist:watch'...
[12:04:33] Finished 'dist:watch' after 6.66 s
[12:04:33] Finished 'dist' after 14 s
```
{% include package-subtasks.md %}