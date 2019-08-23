---
title: Setup
description: Install CloudCannon Suite to your site
permalink: /setup/
layout: suite
_mobile_doc_selector: true
---
This guide covers how to install CloudCannon Suite and use it with a Jekyll project.

## Install prerequisites

First, make sure you have the right tools installed globally.

### Node & npm

npm (Node Package Manager) is a useful JavaScript package manager. It is distributed alongside Node, a JavaScript runtime designed for building network applications.

To check if you have Node and npm installed, run these commands in your terminal:
```bash
$ node -v
$ npm -v
```

If either of these commands fail, follow the [npm install guide](https://www.npmjs.com/get-npm){: target="_blank"} and retry.

### gulp-CLI

Installing the gulp CLI allows you to run the `gulp` command in your terminal.
```bash
$ npm install --global gulp-cli
```

You can confirm the installation worked with `gulp -v`.

## Project structure

Once the prerequisites are installed, you can add the CloudCannon Suite to a Jekyll project. Using the [prescribed file structure](/setup/#structure) helps keep your projects organised and consistent.

### Prepare source directory

A custom source directory keeps the root directory clean and free for configuration. 
Move all Jekyll source (including Gemfile and Gemfile.lock) to the `src` folder. You can do this with the following Bash commands:
```bash
$ mkdir src
$ mv `ls -A | grep -v src` ./src
```
If you don't want to use the command line, this can be done in Finder/Explorer.

### Create a package.json

Create a `package.json` in your project directory, if you don't already have one. If you need help, run `npm init`, which will walk you through giving it a name, version, description, etc.

### Add Dependencies

Open your package.json and add dependencies for Gulp and the CloudCannon Suite as follows:
```json
"dependencies": {
     "gulp": "^4.0.0",
     "@cloudcannon/suite": "^2.0.0-rc6"
}
```

### Install Packages

Run the `npm install` command in your project directory to install all the dependencies specified in your `package.json`.

### Create a gulpfile

Create a file named `gulpfile.js` in your project directory, with the following content:
```js
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.dev(gulp);
```

## Test your suite
Run `gulp dev:install` in your project directory. This runs `bundle install` for your site.

Next run `gulp dev` in your project directory to build and serve your site. See the [Dev package](/dev/introduction) for more information about this.
```bash
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

## Structure

If you run into any issues, check that your project's file structure matches the recommended suite structure. This is defined to increase consistency and organisation between sites.

{% assign sorted = site.data.structure | sort: 'path' %}
<ul class="file-structure">
{% for file in sorted %}
	{% assign parts = file.path | split: "/" %}
	{% assign filename = parts | last %}

	<li class="indent-{{ parts | size }}">
		<strong>
			<i class="material-icons">{% include file-icon.html filename=filename %}</i>
			{{ filename }}
		</strong>

		{{ file.description_markdown | markdownify }}
</li>
{% endfor %}
</ul>
