import gulp from 'gulp';
import rename from 'gulp-rename';
import del from 'del';

export function clean() {
  return del(['deploy/**/*']);
}

export function copy() {
  return gulp
    .src([
      '**/*',
      '**/.gitkeep',
      '!deploy/**/*',
      '!**/*.public',
      '!docs/',
      '!docs/**/*',
      '!node_modules/**/*',
      '!Makefile',
    ])
    .pipe(gulp.dest('deploy'));
}

export function publicCover() {
  return gulp
    .src([
      '**/*.public',
      '!deploy/**/*',
    ])
    .pipe(rename((path) => {
      path.basename = path.basename.replace(/\.public$/, '');
      path.extname = '';
    }))
    .pipe(gulp.dest('deploy'));
}

let build = gulp.series(clean, copy, publicCover);

export default build;
