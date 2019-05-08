---
title: Setup
package: Proofer
order_number: 2
---
To use this package, add the following to your `gulpfile.js`:

```js
suite.proofer(gulp, { 
    internal_domains: ['localhost:4000'], 
    check_external_hash: true, 
    cache: { 
        timeframe: 60000,
        storage_dir: '_cache.json'
    }
});
```

### Usage

Running `gulp proof` will run a check of your compiled site. Errors are logged to your terminal, and saved with more details to `dist/reports/proofer.json`.
 