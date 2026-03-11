const {series, parallel, watch, src, dest} = require('gulp');
const pump = require('pump');
const fs = require('fs');
const order = require('ordered-read-streams');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const zip = require('gulp-zip');

// postcss plugins
const easyimport = require('postcss-easy-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function serve(done) {
    livereload.listen();
    done();
}

function handleError(done) {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    pump([
        src('assets/css/screen.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ], {encoding: false}),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function getJsFiles(version) {
    const jsFiles = [
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/lib/**/*.js`),
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/main.js`),
    ];

    if (fs.existsSync('node_modules/prismjs/components/prism-core.min.js')) {
        jsFiles.push(src([
            'node_modules/prismjs/components/prism-core.min.js',
            'node_modules/prismjs/components/prism-markup.min.js',
            'node_modules/prismjs/components/prism-clike.min.js',
            'node_modules/prismjs/components/prism-css.min.js',
            'node_modules/prismjs/components/prism-javascript.min.js',
            'node_modules/prismjs/components/prism-typescript.min.js',
            'node_modules/prismjs/components/prism-bash.min.js',
            'node_modules/prismjs/components/prism-json.min.js',
            'node_modules/prismjs/components/prism-yaml.min.js',
            'node_modules/prismjs/components/prism-java.min.js',
            'node_modules/prismjs/components/prism-python.min.js',
            'node_modules/prismjs/components/prism-sql.min.js',
            'node_modules/prismjs/components/prism-markdown.min.js',
            'node_modules/prismjs/components/prism-diff.min.js',
            'node_modules/prismjs/components/prism-docker.min.js'
        ]));
    }

    if (fs.existsSync(`assets/js/lib`)) {
        jsFiles.push(src(`assets/js/lib/*.js`));
    }

    jsFiles.push(src(`assets/js/main.js`));

    return jsFiles;
}

function js(done) {
    pump([
        order(getJsFiles('v1'), {sourcemaps: true}),
        concat('main.min.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const filename = require('./package.json').name + '.zip';

    pump([
        src([
            '*.hbs',
            'partials/**',
            'assets/**',
            'routes.yaml',
            'package.json',
            'gulpfile.js',
            'LICENSE',
            'README.md'
        ], {encoding: false, cwdbase: true}),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const cssWatcher = () => watch('assets/css/**/*.css', css);
const jsWatcher = () => watch('assets/js/**/*.js', js);
const watcher = parallel(hbsWatcher, cssWatcher, jsWatcher);
const build = series(css, js);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = series(build, serve, watcher);
