---
title: Configuration
package: Proofer
order_number: 3
config_options:
  - key: allow_missing_href
    use: If set to true, don't report errors about missing hrefs.
  - key: allow_hash_href
    use: If set to true, don't report errors about hrefs with the value "#".
  - key: alt_ignore
    use: A list of `src` attribute values. If the `src` attribute of an image is in this list, the image will ignored for the purposes of checking missing alt tags.
  - key: assume_extension
    use: Setting this to true allows the proofer to assume the extension of a file, when it comes across a path with no extension. The extension it assumes can be set with the "extension" key in the same config.
  - key: check_external_hash
    use: If set to true, check any fragment identifiers on external URLs.
  - key: check_favicon
    use: If set to false, don't check for missing favicon.
  - key: check_img_http
    use: If set to true, report an error when an external image doesn't have an HTTPS src.
  - key: checks_to_ignore
    use: List of checks to ignore.
  - key: directory_index_file
    use: Add this when a file path ends in "/".
  - key: disable_external
    use: If set to true, external links will not be checked.
  - key: empty_alt_ignore
    use: If set to true, don't report an error when an alt tag is an empty string.
  - key: enforce_https
    use: If set to true, report an error when an external non-image element doesn't have HTTPS src.
  - key: extension
    use: File extension to use when `assume_extension` is set to true.
  - key: external_only
    use: If set to true, only external links will be checked.
  - key: file_ignore
    use: List of files to ignore
  - key: http_status_ignore
    use: List of HTTP status codes to ignore when reporting errors
  - key: ignore_mailto
    use: If set to true, "mailto" links will be ignored when checking internal links, so that they don't trigger 404 warnings every time.
  - key: ignore_cc_editor_link
    use: If set to true, [CloudCannon editor links](https://docs.cloudcannon.com/editing/experience/editor-links/) will be ignored when checking internal links, so that they don't trigger 404 warnings every time.
  - key: internal_domains
    use: List of internal domains to check links against.
  - key: only_4xx
    use: If set to true, only report error codes starting with '4' (i.e. 401, 404...).
  - key: src
    use: The directory of the compiled site to check.
  - key: output
    use: Path of the JSON file to write error reports to.
  - key: url_ignore
    use: List of URLs to ignore when checking links.
  - key: cache.timeline
    use: Determines how long to keep items in the cache.
  - key: cache.storage_dir
    use: Path to store cache JSON file.
---
Below is the default configuration for the Proofer package.

```js
{
	allow_missing_href: false,
	allow_hash_href: false,
	alt_ignore: [],
	assume_extension: false,
	check_external_hash: false,
	check_favicon: false,
	check_opengraph: false,
	check_img_http: false,
	checks_to_ignore: [],
	directory_index_file: "index.html",
	disable_external: false,
	empty_alt_ignore: false,
	enforce_https: false,
	error_sort: ":path",
	extension: ".html",
	external_only: false,
	file_ignore: [],
	http_status_ignore: [],
	ignore_mailto: true,
	ignore_cc_editor_links: true,
	internal_domains: [],
	log_level: ":info",
	only_4xx: false,
	src: "dist/site",
	output: "reports/proofer.json",
	url_ignore: [],
	url_swap: {},
	verbose: false,
	cache: {
		timeframe: null,
		storage_dir: null
	}
};
```

### Custom Configuration

You can override these defaults by passing in options in your Gulpfile:

```js
/* gulpfile.js */
suite.proofer(gulp, { 
    internal_domains: ['localhost:4000'], 
    check_external_hash: true, 
    cache: { 
        timeframe: 60000,
        storage_dir: '_cache.json'
    }
});
```

{% include package-config.md %}

