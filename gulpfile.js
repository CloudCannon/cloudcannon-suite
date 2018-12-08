const gulp = require("gulp");
const suite = require(".");

suite.jekyllDocs(gulp);
suite.screenshots(gulp);
suite.help(gulp);
suite.proofer(gulp, { internal_domains: ['localhost:4000'], check_external_hash: true});
