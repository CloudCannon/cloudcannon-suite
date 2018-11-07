---
title: Dev
namespace: jekyllDev
tagline: Develop your Jekyll site
image: /images/build.svg
dev_path: packages/jekyll-dev
_is_package: true
---

```
const gulp = require("gulp");
const suite = require("cloudcannon-suite");

suite.jekyllDev(gulp);
```

### Usage

Running `gulp dev` runs jekyll build on the `src` directory and outputs the site to `dist/site`. Once completed the a local webserver will be started on port 4000. Any changes to the `src` folder will trigger a rebuild of the contents.

```
$ gulp jekyllDev
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

### Subtasks

#### install

Runs `bundle install` on the `src` folder

```
$ gulp jekyllDev:install
```

#### build

Runs` bundle exec jekyll serve` on the `src` folder

```
$ gulp jekyllDev:build
```

#### serve

Runs a local webserver on the `dest` folder

```
$ gulp jekyllDev:serve
```

#### watch

Watches the `src` folder and triggers builds

```
$ gulp jekyllDev:watch
```

### Default Configuration

Below is the default configuration for the Dev package:

```
{
namespace: "dev",
jekyll: {
src: "src",
dest: "dist/site"
},
tasks: [],
serve: {
port: 4000,
open: true
}
}
```

### Configuration

If you have a more complex set up you can use any of the following options with the Dev package.

#### namespace

Sets the namespace of the gulp commands (i.e. gulp namespace:command)

#### jekyll.src

Sets the input folder for jekyll

#### jekyll.dest

Sets the output folder for dev build

#### tasks

Adds additional tasks to be run before the jekyll build. This is useful for reducing build time in jekyll.

#### serve.port

Specifies the port to serve the built site from.

#### serve.open

Should the dev:serve task automatically open a tab in a browser

&nbsp;