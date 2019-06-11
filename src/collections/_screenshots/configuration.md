---
title: Configuration
package: Screenshots
order_number: 3
config_options:
  - key: dest
    use: Output directory for all screenshot commands
  - key: sites
    use: Collection of customisable namespaces for the screenshot commands. A new set of gulp tasks will be defined for each namespace - for example, if you add a "staging" entry, the task `gulp screenshots:staging` will be available to read from a specified location and output to `reports/screenshots/staging/`.
  - key: sites.name.src
    use: Source directory for `gulp screenshots:{name}` tasks.
  - key: sites.name.portInc
    use: Defines the last digit of the port that will be used when taking screenshots.
---
Below is the default configuration for the Screenshots package.

```js
{
    dest: "reports/screenshots",
    sites: {
        dev: {"src": "dist/site", "portInc": 1},
        i18n: {"src": "dist/translated_site", "portInc": 2},
        docs: {"src": "dist/docs", "portInc": 3},
        dist: {"src": "dist/prod", "portInc": 4}
    }
}
```

### Custom Configuration

You can override these defaults by passing in options in your Gulpfile:

```js
/* gulpfile.js */
suite.screenshots(gulp, {
    sites: {
        dev: {"src": "path/to/site/", "portInc": 1 }
    }
});
```

{% include package-config.md %}