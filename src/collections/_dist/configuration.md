---
title: Configuration
package: Dist
order_number: 3
config_options:
  - key: dist.baseurl
    use: "`required` Sets the baseurl to append to urls."
  - key: dist.src
    use: Sets the input folder for dist task. This should contain your compiled site.
  - key: dist.dest
    use: Sets the output folder for dist build.
  - key: serve.port
    use: Specifies the port to serve the built site from.
---
Below is the default configuration for the Distribute package.

```js
{
  dist: {
    src: "dist/site",
    dest: "dist/prod",
    baseurl: ""
  },
  serve: {
    port: 9000,
    open: true,
    path: "/"
  }
};
```

### Custom Configuration

You can override these defaults by passing in options in your Gulpfile:

```js
/* gulpfile.js */
suite.dist(gulp, {
    "dist": {
        "src": "/path/to/src/"
    }
});
```

{% include package-config.md %}
