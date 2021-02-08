// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
const advpng            = require('imagemin-advpng');
const chalk             = require('chalk');
const childProcess      = require('child_process');
const fs                = require('fs');
const gulp              = require('gulp');
const log               = require('fancy-log');
const rollup            = require('rollup');
const rollupJson        = require('@rollup/plugin-json');

const AsepriteCli       = require('./tools/aseprite-cli');
const ImageDataParser   = require('./tools/image-data-parser');
const MapDataParser     = require('./tools/map-data-parser');
const LevelDataParser   = require('./tools/level-data-parser');

// -----------------------------------------------------------------------------
// Gulp Plugins
// -----------------------------------------------------------------------------
const concat            = require('gulp-concat');
const cleancss          = require('gulp-clean-css');
const htmlmin           = require('gulp-htmlmin');
const imagemin          = require('gulp-imagemin');
const rename            = require('gulp-rename');
const size              = require('gulp-size');
const sourcemaps        = require('gulp-sourcemaps');
const template          = require('gulp-template');
const terser            = require('gulp-terser');

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// JS Build
// -----------------------------------------------------------------------------
async function compileBuild() {
    try {
        const bundle = await rollup.rollup({
            input: 'src/js/index.js',
            plugins: rollupJson(),
            onwarn: (warning, rollupWarn) => {
                // Suppress circular dependency warnings
                // (I use circular dependencies with wild abandon)
                if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                    rollupWarn(warning);
                }
            }
        });

        await bundle.write({
            file: 'temp/app.js',
            format: 'iife',
            name: 'app',
            sourcemap: 'inline'
        });
    } catch (error) {
        // Use rollup's error output
        // This hack is for development - I'm using rollup's API here, but I want
        // the output format of the CLI if I have a compile/syntax error. The line
        // below invokes the CLI's error handling so I can see the detailed context.
        require('rollup/dist/shared/loadConfigFile').handleError(error, true);
        throw error;
    }
}

function minifyBuild() {
    return gulp.src('temp/app.js')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(terser({
            // I'm using terser to shrink the JS source size down, every little bit helps
            // for loading speed in the browser -- but we don't need it to be mangled
            // or intentionally obfuscated.
            mangle: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('site/play'));
}

const buildJs = gulp.series(compileBuild, minifyBuild);

// -----------------------------------------------------------------------------
// CSS Build
// -----------------------------------------------------------------------------
function buildCss() {
    return gulp.src('src/app.css')
        .pipe(cleancss())
        .pipe(gulp.dest('site/play'));
}

// -----------------------------------------------------------------------------
// Assets Build
// -----------------------------------------------------------------------------

async function exportSpriteSheet() {
    // Exporting the sprite sheet is the first step - using Aseprite, we take as input
    // all of our source aseprite files, and spit out a single spritesheet PNG and a JSON
    // file containing the x/y/w/h coordinates of the sprites in the spritesheet.

    let src = 'src/assets/*.aseprite';
    let png = 'src/assets/spritesheet-gen.png';
    let data = 'src/assets/spritesheet-gen.json';

    try {
        let r = await AsepriteCli.exec(`--batch ${src} --sheet-type packed --sheet ${png} --data ${data} --format json-array`);
        log.info(r);
    } catch (e) {
        log.error(e);
        log.warn(chalk.red('Failed to update sprite sheet, but building anyway...'));
    }
}

async function generateSpriteSheetData() {
    // After exporting the sprite sheet, we use the JSON data to update a source file used by
    // our asset loader in the game. This way we can freely update images without ever
    // hand-edting any coordinate data or worrying about the composition of the spritesheet.

    let data = 'src/assets/spritesheet-gen.json';
    let image = 'sprites.png';
    let output = 'src/js/SpriteSheet-gen.js';

    await ImageDataParser.parse(data, image, false, output);
}

function copyAssets() {
    return gulp.src('src/assets/spritesheet-gen.png')
        .pipe(rename('sprites.png'))
        .pipe(gulp.dest('site/play'));
}

const buildAssets = gulp.series(
    exportSpriteSheet,
    copyAssets,
    generateSpriteSheetData,
);

// -----------------------------------------------------------------------------
// HTML Build
// -----------------------------------------------------------------------------
function buildHtml() {
    return gulp.src('src/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('site/play'));
}

// -----------------------------------------------------------------------------
// Build
// -----------------------------------------------------------------------------
const build = gulp.series(
    buildAssets,
    buildJs,
    buildCss,
    buildHtml
);

// -----------------------------------------------------------------------------
// Watch
// -----------------------------------------------------------------------------
function watch() {
    watching = true;

    // The watch task watches for any file changes in the src/ folder, _except_ for
    // edits to generated files (called blah-gen by convention).
    gulp.watch(['src/**', '!src/**/*-gen*'], build);
}

// -----------------------------------------------------------------------------
// Task List
// -----------------------------------------------------------------------------
module.exports = {
    // Potentially useful subtasks
    compileBuild,
    minifyBuild,

    // Core build steps
    buildJs,
    buildCss,
    buildAssets,
    buildHtml,

    // Primary entry points
    build,
    watch,

    default: gulp.series(build, watch)
};
