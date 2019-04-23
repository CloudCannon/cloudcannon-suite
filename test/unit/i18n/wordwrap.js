const assert = require("assert");
const Chunk = require("../../../packages/i18n/plugins/chunk");
const wrapParser = require("../../../packages/i18n/plugins/wordwrap-json.js");

describe("Chunk helper functions", function() {
    it("Return false for a nonCJK chunk", function() {
        let chunk = new Chunk("Hello world");
        assert(!chunk.hasCJK());
    });
    it("Return true for a fully CJK chunk", function() {
        let chunk = new Chunk("こんにちは世界");
        assert(chunk.hasCJK());
    });
    it("Return true for a partially CJK chunk", function() {
        let chunk = new Chunk("Hello world: こんにちは世界");
        assert(chunk.hasCJK());
    });

    it("Return true for a punctuation character", function() {
        let chunk = new Chunk("。");
        assert(chunk.isPunctuation());
    });
    it("Return false for a non-punctuation character", function () {
        let chunk = new Chunk("号");
        assert(!chunk.isPunctuation());
    });
    it("Return true for an open-punctuation character", function() {
        let chunk = new Chunk("《");
        assert(chunk.isOpenPunctuation());
    });
    it("Return false for non-open punctuation character", function() {
        let chunk = new Chunk("。");
        assert(!chunk.isOpenPunctuation());
    });
});

describe("Correct parsing", function() {
    it("Correctly parses Ja test cases", async function() {
        let chunks = await wrapParser.segment("六本木ヒルズで、「ご飯」を食べます。", "ja");
        assert(chunks.list[0].word.trim() === "六本木");
        assert(chunks.list[1].word.trim() === "ヒルズで、");
        assert(chunks.list[2].word.trim() === "「ご飯」を");
        assert(chunks.list[3].word.trim() === "食べます。");

        chunks = await wrapParser.segment("これは Android です。", "ja");
        assert(chunks.list[0].word.trim() === "これは");
        assert(chunks.list[1].word.trim() === "Androidです。");
    });

    it("Correctly parses Zh test cases", async function() {
        let chunks = await wrapParser.segment("随时互动交流并掌握最新上海动态", "zh");
        assert(chunks.list[0].word.trim() === "随时");
        assert(chunks.list[1].word.trim() === "互动");
        assert(chunks.list[2].word.trim() === "交流");
        assert(chunks.list[3].word.trim() === "并");
        assert(chunks.list[4].word.trim() === "掌握");
        assert(chunks.list[5].word.trim() === "最新");
        assert(chunks.list[6].word.trim() === "上海");
        assert(chunks.list[7].word.trim() === "动态");
    });
        
});