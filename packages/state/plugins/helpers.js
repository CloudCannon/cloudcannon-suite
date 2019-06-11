var path = require("path");

function isExternalUri(value) {
    return /(^[a-zA-Z]{0,5}:)\//.test(value);
}

function ignoreDataURLs(url, options) {
    return "ignore_data_urls" in options && options["ignore_data_urls"] === true && url.startsWith("data:");
}

function ensureExtension(url, options) {
    var extensionUrl = url;

    if (!/\/$/.test(extensionUrl)) {
        var extension = path.extname(url)
        if (!extension) {
            if (options.extensionless_urls) {
                extensionUrl += ".html";
            } else {
                extensionUrl += "/index.html";
            }
        }
    } else {
        extensionUrl += "index.html";
    }

    return extensionUrl;
}

function makeURLAbsolute(currentPath, url, options) {
    if (isExternalUri(url) || ignoreChecks(url, options)) {
        return url;
    }

    if (url.indexOf("/") === 0) {
        return ensureExtension(url, options);
    }

    var dirname = path.dirname(currentPath);
    var absoluteUrl = path.join(dirname, url);

    return ensureExtension(absoluteUrl, options);
}

function ignoreMailto(url, options) {
    return "ignore_mailto" in options && options["ignore_mailto"] === true && url.includes("mailto:");
}

function ignoreCCEditorLinks(url, options) {
    return "ignore_cc_editor_links" in options && options["ignore_cc_editor_links"] === true && url.startsWith("cloudcannon:");
}

function ignoreChecks(url, options) {
    return ignoreDataURLs(url, options)
        || ignoreMailto(url, options)
        || ignoreCCEditorLinks(url, options);
}

function addURL(data, url, isAsset, options) {
    options = options || {};
    if (ignoreChecks(url, options)) {
        return;
    }
    let dest = "Internal Assets";
    if (isAsset) {
        if (isExternalUri(url)) {
            dest = "External Assets";
        }
    } else {
        if (isExternalUri(url)) {
            dest = "External Links";
        } else {
            dest = "Internal Links";
        }
    }

    if (!(data[dest].includes(url))) {
        data[dest].push(url);
    }
}

module.exports = {
    isExternalUri: isExternalUri,
    ignoreDataURLs: ignoreDataURLs,
    makeURLAbsolute: makeURLAbsolute,
    ignoreMailto: ignoreMailto,
    ignoreCCEditorLinks: ignoreCCEditorLinks,
    ignoreChecks: ignoreChecks,
    addURL: addURL
};