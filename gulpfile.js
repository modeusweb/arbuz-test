// Preprocessor and file watch settings
const preprocessor = 'sass';
const filesWatch = 'html,htm,txt,json,md,woff,woff2';

import pkg from 'gulp';
const { src, dest, parallel, series, watch } = pkg;

import browserSync from 'browser-sync';
import bSsi from 'browsersync-ssi';
import ssi from 'ssi';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
import sassGlob from 'gulp-sass-glob';
import postCss from 'gulp-postcss';
import autoPrefixer from 'autoprefixer';
import concat from 'gulp-concat';
import rsync from 'gulp-rsync';
import { deleteAsync } from 'del';
import plumber from 'gulp-plumber';

const sass = gulpSass(dartSass);

/**
 * Initialize BrowserSync server with SSI middleware
 */
function browserSyncInit() {
  browserSync.init({
    server: {
      baseDir: 'src/',
      middleware: bSsi({ baseDir: 'src/', ext: '.html' }),
    },
    ghostMode: { clicks: false },
    notify: false,
    online: true,
    serveStaticOptions: {
      extensions: ['svg'],
      cacheControl: false,
    },
  });
}

/**
 * Compile and minify stylesheets (Sass or other preprocessors)
 * @returns {Stream} Gulp stream
 */
function compileStyles() {
  return src([
    `src/styles/${preprocessor}/*.*`,
    `!src/styles/${preprocessor}/_*.*`,
  ])
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.error(err.message);
          this.emit('end');
        },
      }),
    )
    .pipe(eval(`${preprocessor}Glob`)())
    .pipe(
      eval(preprocessor)({
        'include css': true,
      }),
    )
    .pipe(postCss([autoPrefixer({ grid: true })]))
    .pipe(concat('style.css'))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream());
}

/**
 * Copy built files to the 'dist' directory
 * @returns {Stream} Gulp stream
 */
function copyBuildFiles() {
  return src(
    ['src/css/*.css', 'src/js/*.js', 'src/img/**/*', 'src/fonts/**/*'],
    {
      base: 'src/',
      encoding: false,
    },
  ).pipe(dest('dist'));
}

/**
 * Compile HTML files using Server Side Includes (SSI)
 */
async function compileHTML() {
  const includes = new ssi('src/', 'dist/', '/**/*.html');
  includes.compile();
  await deleteAsync('dist/partials', { force: true });
}

/**
 * Clean the 'dist' directory
 */
async function cleanDist() {
  await deleteAsync('dist/**/*', { force: true });
}

/**
 * Watch for file changes and re-run tasks
 */
function startWatch() {
  watch(
    [`src/styles/${preprocessor}/**/*`],
    { usePolling: true },
    compileStyles,
  );
  watch(
    ['src/js/**/*.js', '!src/js/**/*.min.js'],
    { usePolling: true },
    browserSync.reload,
  );
  watch([`src/**/*.{${filesWatch}}`], { usePolling: true }).on(
    'change',
    browserSync.reload,
  );
}

// Export tasks
export { compileStyles as styles };
export const assets = series(compileStyles);
export const build = series(
  cleanDist,
  compileStyles,
  copyBuildFiles,
  compileHTML,
);

// Default Gulp task
export default series(compileStyles, parallel(browserSyncInit, startWatch));
