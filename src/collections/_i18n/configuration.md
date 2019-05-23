---
title: Configuration
package: I18n
order_number: 3
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

    legacy_path: "_locales"
  },
  serve: {
    port: 8000,
    open: true
  }
};
```

### Custom Configuration

If you have a more complex set up you can use any of the following options with the I18n package. Configuration options are set in `packages/i18n/index.js`.

#### i18n.src

Sets the input folder for i18n. This should contain a static site, with tagged content.

#### i18n.dest

Sets the output folder for i18n build (destination for the translated site).

#### i18n.default\_language

Sets the default language for the site.

#### i18n.locale\_src

Sets the folder to read the translated json files for i18n:translate.

#### i18n.generated\_locale\_dest

Sets the folder to output the source json file from i18n:generate.

#### i18n.legacy\_path

Sets the folder to transfer legacy locale files with `i18n:legacy-transfer`.

#### serve.port

Specifies the port to serve the built site from.

#### serve.open

Should the `i18n:serve` task automatically open a tab in a browser?