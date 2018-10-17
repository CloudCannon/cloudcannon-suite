const gulp = require("gulp");
const suite = require("cloudcannon-suite");


suite.jekyllDocs(gulp);
suite.screenshots(gulp);
suite.help(gulp);
suite.jekyllDev(gulp);