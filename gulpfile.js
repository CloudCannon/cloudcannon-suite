const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.dev(gulp);
suite.dist(gulp, {
    "dist": {
        "baseurl": "staging"
    }
});
suite.i18n(gulp);
suite.help(gulp);

gulp.task("default", ["help"]);