---
title: Setup
package: I18n
order_number: 2
subtasks:
  - name: build
    desc: Builds the translated site to the `dest` folder. Make sure to run `gulp dev:build` first, so that you have a compiled site to use as the source for this.
    code: gulp i18n:build
  - name: serve
    desc: Runs a local webserver on the `dest` folder.
    code: gulp i18n:serve
  - name: watch
    desc: Watches the `src` and `locale_src` folder to trigger builds.
    code: gulp i18n:watch
  - name: legacy-update
    desc: Converts locales to the legacy system.
    code: gulp i18n:legacy-update
  - name: generate
    desc: Generates the default locale at `i18n/source.json`. This is not run as part of the `gulp i18n` command.
    code: gulp i18n:generate
  - name: check
    desc: Generates a comparison of `i18n/source.json` and `i18n/locales/*.json` at `i18n/checks.json`. This is not run as part of the `gulp i18n` command.
    code: gulp i18n:check
  - name: clean
    desc: Deletes the contents of the `dest` folder.
    code: gulp i18n:clean
  - name: add-character-based-wordwraps
    desc: "Creates a new locale for Japanese translations at `i18n/wrapped/`. This new locale has added span tags to wordwrap characters more appropriately. This requires a Google Cloud   Natural Language API key to be set:"
    lines_of_code:
      - export GOOGLE_APPLICATION_CREDENTIALS='/PATH/TO/CREDENTIALS/credentials.json'
      - gulp i18n:add-character-based-wordwraps
---
### Tagging content

First, tag each HTML element you need to translate by adding a `data-i18n` attribute with a unique key. For example:

```html
<h1 data-i18n="welcome-message">Hello, welcome to my website</h1>
<p data-i18n="intro-text">Please enjoy the following static content...</p>
```

### Locales

Run `gulp i18n:generate` to generate a lookup table, called a "locale", for these keys. The locale determines the content to be shown for each `data-i18n` key.

This generated locale is saved at `i18n/source.json`.

```json
{
  "version": 2,
  "keys": {
    "welcome-message": {
      "original": "Hello, welcome to my website",
      "pages": {
        "/index.html": 1
      },
      "total": 1
    },
    "intro-text": {
      "original": "Please enjoy the following static content...",
      "pages": {
        "/index.html": 1
      },
      "total": 1
    }
  }
}
```

Now create your own alternative locales which provide different (i.e. translated) content for each of the tagged HTML elements. The template is as follows:


```json
{
  "key_name": {
    "original": "Original English translation used to generate value",
    "value": "New translated value"
  }
}
```

Each new locale should: 

* be put in a `i18n/locales` directory (by default)
* use a `.json` file format
* be named after the target language (e.g. `fr.json` for French)

For example:
* `i18n/locales/de.json`
```json
{
    "welcome_message": {
        "original": "Hello, welcome to my website",
        "value": "Hallo, herzlich willkommen auf meiner Website"
    }
}
```
* `i18n/locales/es.json`
```json
{
    "welcome_message": {
        "original": "Hello, welcome to my website",
        "value": "Hola, bienvenido a mi página web"
    }
}
```

### Usage

When you run `gulp i18n`, translated versions of the site are built using these locales. They are served under a baseurl matching the name of the locale - for example, an English version of the site will be served at `localhost:8000/en/`, while a Spanish version will simultaneously be served at `localhost:8000/es/`.

### Gulp setup

To use this package, add `suite.i18n(gulp)` to your Gulpfile:

```js
/* gulpfile.js */
const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.i18n(gulp);
```

### Legacy formats

In version 1 of the CloudCannon suite, source.json and locale files had a different format. This was extended to make status checks possible. The old formats looks like:

```json
{
  "welcome-message": "Hello, welcome to my website",
  "intro-text": "Please enjoy the following static content..."
}
```

To use this version instead, use the following config:

```js
suite.i18n(gulp, {
    "i18n": {
        "source_version": 1
    }
});
```


{% include package-subtasks.md %}