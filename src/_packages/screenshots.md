---
title: Screenshots
namespace: screenshots
description: Generate screenshots of your site using Puppeteer
image: /images/devices.svg
dev_path: packages/reports
_is_package: true
---

Now that you have `@cloudcannon/suite` and `gulp` installed, we have to configure our gulpfile. For a basic setup you can add:

```
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.screenshots(gulp);
```

## Subtasks

```
$ gulp screenshots:
```

## Default Configuration

Below is the default configuration for the Screenshots package:

```
{
    jekyll: {
        src: "docs",
        dest: "dist/docs"
    },
    tasks: [],
    serve: {
        port: 4000,
        open: true
    }
}
```

## Configuration

If you have a more complex set up you can use any of the following options with the Screenshots package.

### jekyll.src

Sets the input folder for jekyll

### jekyll.dest

Sets the output folder for docs build

### tasks

Adds additional tasks to be run before the jekyll build. This is useful for reducing build time in jekyll.

### serve.port

Specifies the port to serve the built site from.

### serve.open

Should the docs:serve task automatically open a tab in a browser