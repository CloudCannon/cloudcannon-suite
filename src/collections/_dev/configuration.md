---
title: Configuration
package: Dev
order_number: 3
config_options:
  - key: namespace
    use: Sets the namespace of the gulp commands (i.e. `gulp namespace:command`)
  - key: jekyll.src
    use: Sets the input folder for Jekyll
  - key: jekyll.dest
    use: Sets the output folder for dev build
  - key: tasks
    use: Adds additional tasks to be run before the Jekyll build. This is useful for reducing build time in Jekyll.
  - key: serve.port
    use: Specifies the port to serve the built site from.
---
Below is the default configuration for the Dev package:

```js
namespace: "dev",
jekyll: {
    src: "src",
    dest: "dist/site"
},
tasks: [],
serve: {
    port: 4000
}
```

### Custom Configuration

You can override these defaults by passing in options in your Gulpfile:

```js
/* gulpfile.js */
suite.dev(gulp, {
    "jekyll": {
        "src": "/path/to/src/"
    }
});
```

{% include package-config.md %}

