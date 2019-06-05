---
title: Setup
package: Proofer
order_number: 2
---
To use this package, add `suite.proofer(gulp)` to your Gulpfile.

```js
/* gulpfile.js */
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.proofer(gulp);
```

### Usage

Running `gulp proof` will run a check of your compiled site. Errors are logged to your terminal, and saved with more details to `dist/reports/proofer.json`.
 