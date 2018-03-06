---
title: Install
in_nav: true
---

Welcome to the install guide. This assumes you have a site already and wish to convert it to the opinionated format.

#### Prepare source

A custom source directory keeps the root directory clean and free for configuration. Move all jekyll source including Gemfile and Gemfile.lock to the `src` folder. To do this with bash use the following command:

```sh
$ mkdir src
$ mv `ls -A | grep -v src` ./src
```

#### Check that you have node and npm installed

To check if you have Node.js installed, run this command in your terminal:

```sh
$ node -v
```

To confirm that you have npm installed you can run this command in your terminal:

```sh
$ npm -v
```

If either of these commands fail, follow the [npm install guide](https://www.npmjs.com/get-npm).

#### Install the gulp-cli

Installing the gulp cli allows you to run the `gulp` command in your terminal:

```sh
$ npm install --global gulp-cli
```

#### Create a `package.json` in your project directory
If you don't have a package.json, create one. If you need help, run an `npm init` which will walk you through giving it a name, version, description, etc.


#### Install your dependencies

Run this command in your project directory:

```sh
$ npm install --save-dev gulp@next cloudcannon-suite
```

#### Create a `gulpfile`

In your project directory, create a file named `gulpfile.js` in your project root with these contents:

```js
const gulp = require("gulp");
const suite = require("cloudcannon-suite");

suite.dev(gulp);
```

#### Test it out

Run the gulp command in your project directory:

```sh
$ gulp dev
```

#### Result

Voila! This will build your site to `dist/site` and serve it on localhost:4000. Any changes made in `src` will trigger another build.

```sh
$ gulp dev
[19:14:48] Using gulpfile ~/Work/cloudcannon/suite/gulpfile.js
[19:14:48] Starting 'dev'...
[19:14:48] Starting 'dev:build'...
[19:14:48] $ bundle exec jekyll build --destination dist/site
Configuration file: src/_config.yml
            Source: src
       Destination: dist/src
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 0.73 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
[19:14:50] Finished 'dev:build' after 1.58 s
[19:14:50] Starting 'dev:watch'...
[19:14:50] Finished 'dev:watch' after 45 ms
[19:14:50] Starting 'dev:serve'...
[19:14:50] Webserver started at http://localhost:4000
[19:14:50] Finished 'dev:serve' after 40 ms
[19:14:50] Finished 'dev' after 1.67 s
```

### What now

Now that you have dev setup you can check out all of the packages available. These can be used to assist with i18n, reporting, testing and more.