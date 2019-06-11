module.exports = {
    isExternalUri: function (value) {
        return /(^[a-zA-Z]{0,5}:)\//.test(value);
    },

    ignoreDataURLs: function (url, options) {
        return "ignore_data_urls" in options && options["ignore_data_urls"] === true && url.startsWith("data:");
    },

    ignoreMailto: function (url, options) {
        return "ignore_mailto" in options && options["ignore_mailto"] === true && url.includes("mailto:");
    },

    ignoreCCEditorLinks: function (url, options) {
        return "ignore_cc_editor_links" in options && options["ignore_cc_editor_links"] === true && url.startsWith("cloudcannon:");
    },

    ignoreChecks: function (url, options) {
        return this.ignoreDataURLs(url, options)
            || this.ignoreMailto(url, options)
            || this.ignoreCCEditorLinks(url, options);
    },

    addURL: function (data, url, isAsset, options) {
        options = options || {};
        if (this.ignoreChecks(url, options)) {
            return;
        }
        let dest = "Internal Assets";
        if (isAsset) {
            if (this.isExternalUri(url)) {
                dest = "External Assets";
            }
        } else {
            if (this.isExternalUri(url)) {
                dest = "External Links";
            } else {
                dest = "Internal Links";
            }
        }
        if (!(data[dest].includes(url))) {
            data[dest].push(url);
        }
    }
};