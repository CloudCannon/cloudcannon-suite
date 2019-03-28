---
title: Setup
package: Dev
order_number: 2
---
To use this package, your `gulpfile.js` needs the following:

```js
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.dev(gulp);
```

### Usage

Running `gulp dev` runs `jekyll build` on the `src` directory and outputs the site to `dist/site`. Once completed the a local webserver will be started on port 4000. Any changes to the `src` folder will trigger a rebuild of the contents.

```sh
$ gulp dev
[12:02:13] Using gulpfile ./gulpfile.js
[12:02:13] Starting 'dev'...
[12:02:13] Starting 'dev:build'...
[12:02:13] $ bundle exec jekyll build --destination dist/site --baseurl
Configuration file: src/_config.yml
Source: src
Destination: dist/site
Incremental build: disabled. Enable with --incremental
Generating...
done in 0.601 seconds.
Auto-regeneration: disabled. Use --watch to enable.
[12:02:15] Finished 'dev:build' after 1.35 s
[12:02:15] Starting 'dev:watch'...
[12:02:15] Finished 'dev:watch' after 39 ms
[12:02:15] Starting 'dev:serve'...
[12:02:15] Webserver started at http://localhost:4000
[12:02:15] Finished 'dev:serve' after 37 ms
[12:02:15] Finished 'dev' after 1.43 s
```

Note that this does _not_ run `bundle install`. To install dependencies for your site under `src`, you need to run `gulp dev:install` before running `gulp dev`.

Note also that you will need to manually run `bundle update` in `src` when you want to update themes and gems.

Use <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop the server running.

### Subtasks

#### install

Runs `bundle install` on the `src` folder

```bash
$ gulp dev:install
```

#### build

Runs `bundle exec jekyll serve` on the `src` folder

```bash
$ gulp dev:build
```

#### serve

Runs a local webserver on the `dest` folder

```bash
$ gulp dev:serve
```

#### watch

Watches the `src` folder and triggers builds

```bash
$ gulp dev:watch
```