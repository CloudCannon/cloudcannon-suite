const gulp = require("gulp");
const suite = require("cloudcannon-suite");

suite.jekyllDev(gulp, {
	serve: {
		port: 4000
	}
});

suite.dev(gulp);
suite.i18n(gulp);
suite.screenshots(gulp);

suite.help(gulp);

gulp.task("default", ["help"]);