const assert = require("assert");
const fs = require("fs");
const HTML = require("../../../packages/distribute/plugins/html");
const BASEURL = "p";

const fileTests = {
    "Rewrites HTML": "/kitchen-sink.html",
    "Preserves Encoding": "/encoding.html"
};

describe("HTML processing", function() {
    for (const name in fileTests) {
        if (fileTests.hasOwnProperty(name)) {
            const filename = fileTests[name];
            it(name, function() {
                let input = fs.readFileSync("test/helper/distribute" + filename, "utf8");
                let expected = fs.readFileSync("test/helper/distribute/output" + filename, "utf8");
                let rewritten = HTML.rewrite(input, filename, BASEURL);
    
                assert(rewritten);
                assert.equal(rewritten, expected);
            });
            
        }
    }

    it("Returns a Plugin", function() {
        assert(!!HTML.plugin);
    });
});