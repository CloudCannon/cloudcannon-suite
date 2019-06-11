const assert = require("assert");
const functions = require("../../../packages/state/plugins/helpers");
const processing = require("../../../packages/state/plugins/processing");
const cheerio = require("cheerio");
const fs = require("fs");

describe("Dependency tree", function () {
    describe("Check helper functions", function () {
        it("Recognise external URLs", function () {
            assert(functions.isExternalUri("http://app.cloudcannon.com"));
            assert(functions.isExternalUri("https://app.cloudcannon.com"));
        });
        it("Recognise internal URLs", function () {
            assert(!functions.isExternalUri("/"));
            assert(!functions.isExternalUri("/posts/my-cool-post.html"));
        });
        it("Ignore data URLs if asked", function () {
            assert(functions.ignoreDataURLs("data:image/svg+xml;base64,[data]", {
                "ignore_data_urls": true
            }));
            assert(!functions.ignoreDataURLs("data:image/svg+xml;base64,[data]", {
                "ignore_data_urls": false
            }));
            assert(!functions.ignoreDataURLs("/images/icon.svg", {
                "ignore_data_urls": true
            }));
            assert(!functions.ignoreDataURLs("/images/icon.svg", {
                "ignore_data_urls": false
            }));
        });
        it("Ignore mailto links if asked", function () {
            assert(functions.ignoreMailto("mailto:ryan@cloudcannon.com?Subject=Hello", {
                "ignore_mailto": true
            }));
            assert(!functions.ignoreMailto("mailto:ryan@cloudcannon.com?Subject=Hello", {
                "ignore_mailto": false
            }));
            assert(!functions.ignoreMailto("https://en.wikipedia.org/wiki/Mailto", {
                "ignore_mailto": false
            }));
        });
        it("Ignore CloudCannon editor links if asked", function () {
            assert(functions.ignoreCCEditorLinks("cloudcannon:collections/_staff/", {
                "ignore_cc_editor_links": true
            }));
            assert(!functions.ignoreCCEditorLinks("cloudcannon:collections/_staff/", {
                "ignore_cc_editor_links": false
            }));
            assert(!functions.ignoreCCEditorLinks("https://docs.cloudcannon.com/editing/experience/editor-links/", {
                "ignore_cc_editor_links": false
            }));
        });

        describe("Add URLs to data appropriately", function () {
            describe("Ignore options", function () {
                it("Ignore data URLs", function () {
                    let data = {"Internal Assets": []};
                    functions.addURL(data, "data:,Hello%2C%20World!", true, {"ignore_data_urls": true});
                    assert(data["Internal Assets"].length == 0);
                });
                it("Ignore mailto", function () {
                    let data = {"Internal Links": []};
                    functions.addURL(data, "mailto:ryan@cloudcannon.com", false, {"ignore_mailto": true});
                    assert(data["Internal Links"].length == 0);
                });
                it("Ignore CloudCannon editor link URLs", function () {
                    let data = {"Internal Links": []};
                    functions.addURL(data, "cloudcannon:collections/_staff/", false, {"ignore_cc_editor_links": true});
                    assert(data["Internal Links"].length == 0);
                });
            });
            
            it("Put URLs into appropriate keys", function () {
                let data = {"Internal Assets": [], "Internal Links": [],
                            "External Assets": [], "External Links": []};
                functions.addURL(data, "internal-asset.png", true);
                functions.addURL(data, "internal-link.com", false);
                functions.addURL(data, "https://external-asset.png", true);
                functions.addURL(data, "http://external-link.com", false);

                assert(data["Internal Assets"].length == 1);
                assert(data["Internal Assets"][0] == "internal-asset.png");

                assert(data["Internal Links"].length == 1);
                assert(data["Internal Links"][0] == "internal-link.com");

                assert(data["External Assets"].length == 1);
                assert(data["External Assets"][0] == "https://external-asset.png");

                assert(data["External Links"].length == 1);
                assert(data["External Links"][0] == "http://external-link.com");
            });
        });
    });

    describe("File processing", function() {
        it("Process HTML", function() {
            let content = cheerio.load(fs.readFileSync("test/helper/state/state-test.html", "utf8"));
            let data = processing.processHTML(content, {"scan_js": true}, ["/about", "/images/pic.svg"]);

            assert(data["Internal Assets"].length == 10);
            assert(data["External Assets"].length == 2);
            assert(data["Internal Links"].length == 1);
            assert(data["External Links"].length == 1);
        });
        it("Process CSS", function() {
            let content = fs.readFileSync("test/helper/state/state-test.css", "utf8");
            let data = processing.processCSS(content, {});

            assert(data["Internal Assets"].length == 4);
            assert(data["External Assets"].length == 4);
        });  
        it("Process JavaScript", function() {
            let content = fs.readFileSync("test/helper/state/state-test.js", "utf8");
            let data = processing.processJS(content.replace(/\s/g, ""), {}, [
                "pic1.svg", "pic2.jpg", "pic3.png",
                "/about", "/blog", "/index"
            ]);

            assert(data["Internal Assets"].length == 3);
            assert(data["Internal Links"].length == 3);
        });
    });
});