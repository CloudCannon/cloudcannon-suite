---
title: Configuration
package: I18n
order_number: 3
config_options:
  - key: i18n.src
    use: Sets the input folder for i18n. This should contain a static site, with tagged content.
  - key: i18n.dest
    use: Sets the output folder for i18n build (destination for the translated site).
  - key: i18n.default\_language
    use: Sets the default language for the site (i.e. the language of `source.json`).
  - key: i18n.locale\_src
    use: Sets the folder to read the translated json files for i18n:translate.
  - key: i18n.generated\_locale\_dest
    use: Sets the folder to output the source json file from i18n:generate.
  - key: i18n.legacy\_path
    use: Sets the folder to transfer legacy locale files with `i18n:legacy-transfer`.
  - key: i18n.source_version
    use: What version should be expected and generated for `i18n/source.json`.
  - key: i18n.source_delimeter
    use: What character should be used to format the json in `i18n:generate`.
  - key: serve.port
    use: Specifies the port to serve the built site from.
---
Below is the default configuration for the I18n package:

```js
{
  i18n: {
    src: "dist/site",
    dest: "dist/translated_site",

    default_language: "en",
    locale_src: "i18n/locales",
    generated_locale_dest: "i18n",

		source_version: 2,
		source_delimeter: "\t",

    legacy_path: "_locales"
  },
  serve: {
    port: 8000,
    open: true
  }
};
```

### Custom Configuration

You can override these defaults by passing in options in your Gulpfile:

```js
/* gulpfile.js */
suite.i18n(gulp, {
    "i18n": {
        "default_language": "fr"
    }
});
```

{% include package-config.md %}
