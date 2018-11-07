---
title: Distribute
namespace: dist
tagline: Baseurl configured in one spot not everywhere
image: /images/shipping.svg
dev_path: packages/distribute
_is_package: true
---

Now that you have `cloudcannon-suite` and `gulp` installed, we have to configure our gulpfile. For a basic setup you can add:

```
const gulp = require("gulp");
const suite = require("cloudcannon-suite");

suite.dist(gulp, {"dist":{"baseurl":"p"}});
```

### Usage

Running `gulp dist` adds a baseurl to the entire site at `src`. HTML and CSS files are rewritten to fix references to the new folder structure. All files are cloned into the `dist` folder with the baseurl prepended. Once completed a local webserver will be started on port 9000. Any changes to the `src` folder will trigger a rebuild of the contents.

```
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

Compiles HTML and CSS to be run at a base url

```
$ gulp dist:build
```

#### serve

Runs a local webserver on the `dest` folder

```
$ gulp dist:serve
```

#### watch

Watches the `src` folder and triggers builds

```
$ gulp dist:watch
```

#### rewrite-html

Clones HTML files from `src` to `dist` and rewrites attributes to include baseurl (`src`, `href`, `srcset` and `meta[http-equiv='refresh']`)

```
$ gulp dist:rewrite-html
```

#### rewrite-css

Clones CSS files from src to dist and rewrites urls to include baseurl

```
$ gulp dist:rewrite-css
```

#### clone-assets

Clones all other files from `src` to `dist`

```
$ gulp dist:clone-assets
```

#### clean

Removes all files from the `dist` folder

```
$ gulp dist:clean
```

#### Default Configuration

Below is the default configuration for the Distribute package:

```
{
  dist: {
  src: "dist/site",
  dest: "dist/prod",
  baseurl: ""
  },
  serve: {
  port: 9000,
  open: true,
  path: "/"
  }
}
```

### Configuration

If you have a more complex set up you can use any of the following options with the Distribute package.

#### dist.baseurl `required`

Sets the baseurl to append to urls.

#### dist.src

Sets the input folder for dist task

#### dist.dest

Sets the output folder for dist build

#### serve.port

Specifies the port to serve the built site from.

#### serve.open

Should the docs:serve task automatically open a tab in a browser

&nbsp;