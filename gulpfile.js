const gulp = require("gulp");
const suite = require(".");

suite.dev(gulp);
suite.i18n(gulp);
suite.screenshots(gulp);
suite.help(gulp);
suite.dist(gulp, {"dist":{"baseurl":"p"}});
