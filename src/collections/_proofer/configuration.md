---
title: Configuration
package: Proofer
order_number: 3
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
	output: "dist/reports/proofer.json",
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

If you have a more complex setup, you can use any of the following options. These options are configurable in `packages/proofer/defaults.js`.

#### allow_missing_href

If set to true, don't report errors about missing hrefs.

#### allow_hash_href

If set to true, don't report errors about hrefs with the value "#".

#### alt_ignore

A list of `src` attribute values. If the `src` attribute of an image is in this list, the image will ignored for the purposes of checking missing alt tags.

#### assume_extension

Setting this to true allows the proofer to assume the extension of a file, when it comes across a path with no extension. The extension it assumes can be set with the "extension" key in the same config.

#### check_external_hash

If set to true, check any fragment identifiers on external URLs.

#### check_favicon

If set to false, don't check for missing favicon.

#### check_img_http

If set to true, report an error when an external image doesn't have an HTTPS src.

#### checks_to_ignore

List of checks to ignore.

#### directory_index_file

Add this when a file path ends in "/".

#### disable_external

If set to true, external links will not be checked.

#### empty_alt_ignore

If set to true, don't report an error when an alt tag is an empty string.

#### enforce_https

If set to true, report an error when an external non-image element doesn't have HTTPS src.

#### extension

File extension to use when `assume_extension` is set to true.

#### external_only

If set to true, only external links will be checked.

#### file_ignore

List of files to ignore

#### http_status_ignore

List of HTTP status codes to ignore when reporting errors

#### ignore_mailto

If set to true, "mailto" links will be ignored when checking internal links, so that they don't trigger 404 warnings every time.

#### ignore_cc_editor_link

If set to true, [CloudCannon editor links](https://docs.cloudcannon.com/editing/experience/editor-links/) will be ignored when checking internal links, so that they don't trigger 404 warnings every time.

#### internal_domains

List of internal domains to check links against.

#### only_4xx

If set to true, only report error codes starting with '4' (i.e. 401, 404...).

#### src

The directory of the compiled site to check.

#### output

Path of the JSON file to write error reports to.

#### url_ignore

List of URLs to ignore when checking links.

#### cache.timeline

Determines how long to keep items in the cache.

#### cache.storage_dir

Path to store cache JSON file.