---
title: Setup
package: Screenshots
order_number: 2
subtasks:
  - name: clean
    desc: Delete everything in the output destination folder `reports/screenshots`.
    code: gulp screenshots:clean
  - name: dev-takescreens
    desc: Outputs screenshots of every page to output directory, with a JSON file mapping i18n tag information to coordinates.
    code: gulp screenshots:dev-takescreens
  - name: dev
    desc: First, this runs `dev-takescreens` to create screenshots and JSON mappings. Then, it generates a JSON index file at the root, to use for searching i18n keys.
    code: gulp screenshots:dev
  - name: dev-tool
    desc: First, this runs `dev` to create screenshots, JSON mappings, and an index file. Then, it generates and serves a static site which allows you to search and review your translated content.
    code: gulp screenshots:dev-tool
  - name: dev:clean
    desc: Delete everything in the output destination folder `reports/screenshots/dev`.
    code: gulp screenshots:dev:clean
---
To use this package, add `suite.screenshots(gulp)` to your Gulpfile.

```js
/* gulpfile.js */
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.dev(gulp);
suite.screenshots(gulp);
```

### Usage

Run `gulp screenshots:dev` to read a compiled site at `/dist/site/` and output screenshots of each page to `/reports/screenshots/dev`.

Run `gulp screenshots:dev-tool` to build and serve a static site where you can view and search your i18n source tags mapped onto screenshots.

Run `gulp screenshots:i18n-tool` to use the same tools with your `dist/translated_site` from the i18n package. Now you can see all your translated content in place, searchable by tag.

You can customise these commands in the [configuration](/screenshots/configuration). For each namespace defined in the configuration options, a new set of gulp tasks will be available. For example, if you have a "staging" entry, the task `gulp screenshots:staging` can be used to read from a custom specified location and output to `reports/screenshots/staging`. 

{% include package-subtasks.md %}

`dev` in the above commands can be replaced with any namespace in the configuration.