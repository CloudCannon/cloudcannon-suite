var through = require("through2").obj,
    cheerio = require("cheerio"),
    srcsetParser = require("srcset");

function isExternalUri (value) {
    return /(^[a-zA-Z]{0,5}:)|(^)\/\//.test(value);
}

function ignoreMailto (url, options) {
    return "ignore_mailto" in options && options["ignore_mailto"] === true && url.includes("mailto:");
}

function ignoreCCEditorLinks (url, options) {
    return "ignore_cc_editor_links" in options && options["ignore_cc_editor_links"] === true && url.includes("cloudcannon:");
}

function processCSS (content, options) {
    var data = {
        "Assets": [],
        "Internal Links": [],
        "External Links": []
    };
    function addURL (url) {
        if (isExternalUri(url) && !(data["External Links"].includes(url))) {
            data["External Links"].push(url);
        } else if (!isExternalUri(url) && !data["Internal Links"].includes(url)) {
            data["Internal Links"].push(url);
        }
    }
    var startIndex = 0;
    while (startIndex < content.length) {
        var urlIndex = content.indexOf("url(", startIndex);
        var endIndex = content.indexOf(");", urlIndex);
        if (urlIndex === -1 || endIndex === -1) {
            break;;
        }
        var url = content.slice(urlIndex + 5, endIndex -1);
        addURL(url);

        startIndex = endIndex;
    }
    return data;  
};
function processHTML ($, options, files) {
    var data = {
        "Assets": [],
        "Internal Links": [],
        "External Links": []
    };
    function addURL (url) {
        if (isExternalUri(url) && !(data["External Links"].includes(url))) {
            data["External Links"].push(url);
        } else if (!isExternalUri(url) && !data["Internal Links"].includes(url)) {
            data["Internal Links"].push(url);
        }
    }
    $("[href]").each(function () {
        var href = $(this).attr("href");
        if (href === "" || href[0] === "#" || ignoreMailto(href, options) || ignoreCCEditorLinks(href, options)) {
            return;
        }
        addURL(href);
    });
    $("[src]").each(function () {
        var src = $(this).attr("src");
        if (!isExternalUri(src) && !(data["Assets"].includes(src))) {
            data["Assets"].push(src);
        }
    });
    $("[srcset]").each(function () {
        var srcset = $(this).attr("srcset");
        var parsed = srcsetParser.parse(srcset);
        for (var i = 0; i < parsed.length; i++) {
            var url = parsed[i].url;
            if (url !== "" && !(data["Assets"].includes(url))) {
                data["Assets"].push(url);
            }
        }
    });
    $("meta[http-equiv='refresh']").each(function () {
        var content = $(this).attr("content");
        var parts = content.split(";");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].indexOf("url=") === 0) {
                var href = parts[i].substring(4);
                addURL(href);
                return;
            }
        }
    });
    $("style").each(function () {
        var style = $(this).html().replace(/\s/g, "");
        var startIndex = 0;
        while (startIndex < style.length) {
            var urlIndex = style.indexOf("url(", startIndex);
            var endIndex = style.indexOf(");", urlIndex);
            if (urlIndex === -1 || endIndex === -1) {
                return;
            }
            var url = style.slice(urlIndex + 5, endIndex -1);
            addURL(url);

            startIndex = endIndex;
        }
    });
    $("script").each(function () {
        var script = $(this).html();
        // for each filename, add url if script.includes(filename)
        files.forEach(function(filename) {
            if (script.includes(filename)) {
                addURL(filename);
            }
        });

    });
    return data;
};

module.exports = function (config, filenameList) {
    const options = config || {};
    const files = filenameList || [];

    return through(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            return callback(null, file);
        }

        file.sitePath = file.path.substring(file.base.length);
        file.sitePath = file.sitePath.replace(/\/index.html?/i, "/");
        
        var ext = file.path.split(".").pop();
        var data = { "Assets": [], "Internal Links": [], "External Links": [] };
        if (ext === "html") {
            var $ = cheerio.load(file.contents.toString(encoding), { lowerCaseAttributeNames:false, decodeEntities: false });
            data = processHTML($, options, files);
        } else if (ext === "css") {
            var content = file.contents.toString(encoding);
            data = processCSS(content.replace(/\s/g, ""), options);
        }

        this.push([file.sitePath, data]);
        callback();
    });
}; 