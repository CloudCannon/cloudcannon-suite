---
title: Setup
package: Dist
order_number: 2
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

### Subtasks

#### build

Compiles HTML and CSS to be run at a baseurl

```bash
$ gulp dist:build
```

#### serve

Runs a local webserver on the `dest` folder

```bash
$ gulp dist:serve
```

#### watch

Watches the `src` folder and triggers builds

```bash
$ gulp dist:watch
```

#### rewrite-html

Clones HTML files from `src` to `dist` and rewrites attributes to include baseurl (`src`, `href`, `srcset` and `meta[http-equiv='refresh']`)

```bash
$ gulp dist:rewrite-html
```

#### rewrite-css

Clones CSS files from src to dist and rewrites urls to include baseurl

```bash
$ gulp dist:rewrite-css
```

#### clone-assets

Clones all other files from `src` to `dist`

```bash
$ gulp dist:clone-assets
```

#### clean

Removes all files from the `dist` folder

```bash
$ gulp dist:clean
```