var through = require("through2").obj,
    cheerio = require("cheerio"),
    process = require("./processing");

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
        
        var ext = file.path.split(".").pop();
        var data = {"Internal Assets": [], "External Assets": [], "Internal Links": [], "External Links": []};

        if (ext === "html") {
            var $ = cheerio.load(file.contents.toString(encoding), { lowerCaseAttributeNames:false, decodeEntities: false });
            data = process.processHTML($, file.sitePath, options, files);
        } else if (ext === "css") {
            var content = file.contents.toString(encoding);
            data = process.processCSS(content.replace(/\s/g, ""), file.sitePath, options);
        } else if (ext === "js" && "scan_js" in options && options["scan_js"] === true) {
            var content = file.contents.toString(encoding);
            data = process.processJS(content.replace(/\s/g, ""), file.sitePath, options, files);
        }

        this.push([file.sitePath, data]);
        callback();
    });
};
