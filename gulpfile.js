const gulp = require("gulp");
const suite = require(".");

suite.dev(gulp);
suite.dist(gulp, {
    "dist": {
        "baseurl": "staging"
    }
});
suite.i18n(gulp);
suite.state(gulp, {});
suite.help(gulp);

gulp.task("default", gulp.series("help"));