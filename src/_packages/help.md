---
title: Help
namespace: help
tagline: List the available tasks
image: /images/help.svg
dev_path: packages/help
order: 5
_is_package: true
---

Now that you have `cloudcannon-suite` and `gulp` installed, we have to configure our gulpfile. For a basic setup you can add:
{: .present-before-paste}

```
const gulp = require("gulp");
const suite = require("cloudcannon-suite");

suite.help(gulp);
```

### Usage

Running `gulp help` lists all tasks installed in your gulp configuration.
{: .present-before-paste}

```
$ gulp help
[09:54:07] Using gulpfile ./gulpfile.js
[09:54:07] Starting 'help'...

Main Tasks
------------------------------
    docs
    help

Sub Tasks
------------------------------
    docs:build
    docs:install
    docs:serve
    docs:watch

[09:54:07] Finished 'help' after 1.86 ms
```