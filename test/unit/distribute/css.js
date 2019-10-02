const assert = require("assert");
const fs = require("fs");
const CSS = require("../../../packages/distribute/plugins/css");

describe("CSS processing", function() {
    it("Rewrites CSS", function() {
        let css = fs.readFileSync("test/helper/distribute/style.css", "utf8");
        let expected = fs.readFileSync("test/helper/distribute/output/style.css", "utf8");
        let rewritten = CSS.rewrite(css, "/style.css", "p");

        assert(rewritten);
        assert.equal(rewritten, expected);
    });

    it("Returns a Plugin", function() {
        assert(!!CSS.plugin);
    });
});