---
title: Introduction
package: Help
order_number: 1
---

The _Help_ command lists all the tasks and subtasks you have available.

### Setup

To use this package, your `gulpfile.js` needs the following:

```js
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.help(gulp);
```

### Usage

Running `gulp help` lists all tasks installed in your gulp configuration.
{: .present-before-paste}

```sh
$ gulp help
[09:54:07] Using gulpfile ./gulpfile.js
[09:54:07] Starting 'help'...

Main Tasks
------------------------------
    dev
    dist

Sub Tasks
------------------------------
    dev:browser-sync
    dev:build
    dev:install
    dev:reload
    dev:serve
    dev:watch
    dist:browser-sync
    dist:build
    dist:clean
    dist:clone-assets
    dist:reload
    dist:rewrite-css
    dist:rewrite-html
    dist:serve
    dist:watch

[09:54:07] Finished 'help' after 1.86 ms
```