var srcsetParser = require("srcset"),
    helpers = require("./helpers");

module.exports = {
    processJS: function (content, options, files) {
        var data = {
            "Internal Assets": [],
            "Internal Links": []
        };
        files.forEach(function(filename) {
            if (filename === "/") {
                return;
            }
            if (content.includes(`"${filename}"`) || content.includes(`'${filename}'`)) {
                if (helpers.ignoreChecks(filename, options)) {
                    return;
                }
                let dest = "Internal Links";
                if (/\.[a-zA-Z]{2,4}$/.test(filename)) {
                    dest = "Internal Assets";
                }
                if (!(data[dest].includes(filename))) {
                    data[dest].push(filename);
                }
            }
        });
        return data;
    },

    processCSS: function (content, options) {
        var data = {
            "Internal Assets": [],
            "External Assets": [],
            "Internal Links": [],
            "External Links": []
        };
        var startIndex = 0;
        while (startIndex < content.length) {
            var urlIndex = content.indexOf("url(", startIndex);
            var endIndex = content.indexOf(")", urlIndex);
            if (urlIndex === -1 || endIndex === -1) {
                break;
            }
            var url = content.slice(urlIndex + 4, endIndex);
            if (url.startsWith('"') || url.startsWith("'")) {
                url = url.slice(1, url.length - 1);
            }
            if (helpers.ignoreChecks(url, options)) {
                return;
            }
            let dest = helpers.isExternalUri(url) ? "External Assets" : "Internal Assets";
            if (!(data[dest].includes(url))) {
                data[dest].push(url);
            }
            startIndex = endIndex;
        }
        return data;  
    },

    processHTML: function ($, options, files) {
        var data = {
            "Internal Assets": [],
            "External Assets": [],
            "Internal Links": [],
            "External Links": []
        };
        $("a").each(function () {
            var href = $(this).attr("href");
            if (!href || href === "" || href.includes("#")) {
                return;
            }
            helpers.addURL(data, href, false, options);
        });
        $("link").each(function () {
            var href = $(this).attr("href");
            if (!href || href === "") {
                return;
            }
            helpers.addURL(data, href, true, options);
        });
        $("[src]").each(function () {
            var src = $(this).attr("src");
            helpers.addURL(data, src, true, options);
        });
        $("[srcset]").each(function () {
            var srcset = $(this).attr("srcset");
            var parsed = srcsetParser.parse(srcset);
            for (var i = 0; i < parsed.length; i++) {
                var url = parsed[i].url;
                helpers.addURL(data, url, true, options);
            }
        });
        $("meta[http-equiv='refresh']").each(function () {
            var content = $(this).attr("content");
            var parts = content.split(";");
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].indexOf("url=") === 0) {
                    var href = parts[i].substring(4);
                    helpers.addURL(data, href, false, options);
                    return;
                }
            }
        });
        $("style").each(function () {
            var style = $(this).html().replace(/\s/g, "");
            var startIndex = 0;
            while (startIndex < style.length) {
                var urlIndex = style.indexOf("url(", startIndex);
                var endIndex = style.indexOf(")", urlIndex);
                if (urlIndex === -1 || endIndex === -1) {
                    return;
                }
                var url = style.slice(urlIndex + 4, endIndex);
                if (url.startsWith('"') || url.startsWith("'")) {
                    url = url.slice(1, url.length - 1);
                }
                helpers.addURL(data, url, true, options);

                startIndex = endIndex;
            }
        });
        if ("scan_js" in options && options["scan_js"] === true) {
            $("script").each(function () {
                var script = $(this).html();
                // for each filename, add url if script.includes(filename)
                files.forEach(function(filename) {
                    if (script.includes(`"${filename}"`) || script.includes(`'${filename}'`)) {
                        if (helpers.ignoreChecks(filename, options)) {
                            return;
                        }
                        let dest = "Internal Links";
                        if (/\.[a-zA-Z]{2,4}$/.test(filename)) {
                            dest = "Internal Assets";
                        }
                        if (!(data[dest].includes(filename))) {
                            data[dest].push(filename);
                        }
                    }
                });
            });
        }
        return data;
    }
};
