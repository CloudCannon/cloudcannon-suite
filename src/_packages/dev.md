---
title: Dev
namespace: jekyllDev
tagline: Develop your Jekyll site
image: /images/build.svg
commands:
  - task: install
    description_markdown: Runs `bundle install` on the `src` folder
  - task: build
    description_markdown: Runs `bundle exec jekyll serve` on the `src` folder
  - task: serve
    description_markdown: Runs a local webserver on the `dest` folder
  - task: watch
    description_markdown: Watches the `src` folder and triggers builds
output_markdown: >-
  Running `gulp dev` runs jekyll build on the `src` directory and outputs the
  site to `dist/site`. Once completed the a local webserver will be started on
  port 4000. Any changes to the `src` folder will trigger a rebuild of the
  contents.
output_code: >-
  [12:02:13] Using gulpfile ./gulpfile.js[12:02:13] Starting 'dev'...[12:02:13]
  Starting 'dev:build'...[12:02:13] $ bundle exec jekyll build --destination
  dist/site --baseurlConfiguration file: src/_config.yml          Source:
  src     Destination: dist/siteIncremental build: disabled. Enable with
  --incremental    Generating...                  done in 0.601
  seconds.Auto-regeneration: disabled. Use --watch to enable.[12:02:15] Finished
  'dev:build' after 1.35 s[12:02:15] Starting 'dev:watch'...[12:02:15] Finished
  'dev:watch' after 39 ms[12:02:15] Starting 'dev:serve'...[12:02:15] Webserver
  started at http://localhost:4000[12:02:15] Finished 'dev:serve' after 37
  ms[12:02:15] Finished 'dev' after 1.43 s
default_json_code: "{\tnamespace: \"dev\",\tjekyll: {\t\tsrc: \"src\",\t\tdest: \"dist/site\"\t},\ttasks: [],\tserve: {\t\tport: 4000,\t\topen: true\t}}"
config:
  - key: namespace
    description_markdown: 'Sets the namespace of the gulp commands (i.e. gulp namespace:command)'
    required: false
  - key: jekyll.src
    description_markdown: Sets the input folder for jekyll
    required: false
  - key: jekyll.dest
    description_markdown: Sets the output folder for dev build
    required: false
  - key: tasks
    description_markdown: >-
      Adds additional tasks to be run before the jekyll build. This is useful
      for reducing build time in jekyll.
    required: false
  - key: serve.port
    description_markdown: Specifies the port to serve the built site from.
    required: false
  - key: serve.open
    description_markdown: 'Should the dev:serve task automatically open a tab in a browser'
    required: false
dev_path: packages/jekyll-dev
order: '1'
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

### namespace

Sets the namespace of the gulp commands (i.e. gulp namespace:command)

### jekyll.src

Sets the input folder for jekyll

### jekyll.dest

Sets the output folder for dev build

### tasks

Adds additional tasks to be run before the jekyll build. This is useful for reducing build time in jekyll.

### serve.port

Specifies the port to serve the built site from.

### serve.open

Should the dev:serve task automatically open a tab in a browser

&nbsp;