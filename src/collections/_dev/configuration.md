---
title: Configuration
package: Dev
order_number: 3
---
Below is the default configuration for the Dev package:

```js
{
    namespace: "dev",
    jekyll: {
        src: "src",
        dest: "dist/site"
    },
    tasks: [],
    serve: {
        port: 4000,
        open: true
    }
}
```

### Custom Configuration

If you have a more complex set up you can use any of the following options with the Dev package.  Configuration options are set in `packages/jekyll-dev/index.js`.

#### namespace

Sets the namespace of the gulp commands (i.e. gulp namespace:command)

#### jekyll.src

Sets the input folder for Jekyll

#### jekyll.dest

Sets the output folder for dev build

#### tasks

Adds additional tasks to be run before the Jekyll build. This is useful for reducing build time in Jekyll.

#### serve.port

Specifies the port to serve the built site from.

#### serve.open

Should the dev:serve task automatically open a tab in a browser