---
title: Configuration
package: State
order_number: 3
config_options:
  - key: state.src
    use: The location of the compiled site to scan.
  - key: state.dest
    use: The location to output the visualiser static site.
  - key: state.report
    use: The location to output JSON reports.
  - key: state.port 
    use: The port on which to serve the visualiser site.
  - key: options.ignore_data_urls
    use: Unless set to true, the scanner will pick up data urls as referenced assets, and include them in the reports.
  - key: options.ignore_mailto
    use: Unless set to true, the scanner will pick up `mailto:` links in the HTML, and include them in the reports.
  - key: options.ignore_cc_editor_links
    use: Unless set to true, the scanner will pick up [CloudCannon editor links](https://docs.cloudcannon.com/editing/experience/editor-links/) and include them in the reports.
  - key: options.scan_js
    use: If set to true, the scanner will also scan all your JavaScript files and `<script>` tags for references. This causes it to run slower, but may build a more accurate/detailed dependency graph.
---
Below is the default configuration for the State package:

```js
state: {
    src: "dist/site",
    dest: "dist/state",
    report: "reports/state",
},
serve: {
    port: 9001,
},
options: {
    ignore_inline_svg: true,
    ignore_mailto: true,
    ignore_cc_editor_links: true,
    scan_js: true
}
```

### Custom Configuration

You can override these defaults by passing in options in your Gulpfile:

```js
/* gulpfile.js */
suite.state(gulp, {
    "state": {
        "src": "/custom/path/to/source/"
    }
});
```

{% include package-config.md %}