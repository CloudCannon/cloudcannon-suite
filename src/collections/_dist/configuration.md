---
title: Configuration
package: Dist
order_number: 3
---
Below is the default configuration for the Distribute package.

```js
{
  dist: {
    src: "dist/site",
    dest: "dist/prod",
    baseurl: "",
    extraSrcAttrs: []
  },
  serve: {
  port: 9000,
  open: true,
  path: "/"
  }
};
```

### Custom Configuration

If you have a more complex set up you can use any of the following options with the Distribute package.  Configuration options are set in `packages/distribute/index.js`.

#### dist.baseurl `required` 

Sets the baseurl to append to urls.

#### dist.src

Sets the input folder for dist task

#### dist.dest

Sets the output folder for dist build

#### dist.extraSrcAttrs

An array of extra attributes to be rewritten (e.g. data-src)

#### serve.port

Specifies the port to serve the built site from.

#### serve.open

Should the docs:serve task automatically open a tab in a browser