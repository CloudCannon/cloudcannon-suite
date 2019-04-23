module.exports = {
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