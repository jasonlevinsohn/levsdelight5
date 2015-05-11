var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var cleanDest = require('gulp-clean-dest');
var less = require('gulp-less');


gulp.task('clean', function() {
    gulp.src('build/')
        .pipe(clean());

});

gulp.task('copy', function() {

    // Index file
    gulp.src('index.html')
        .pipe(cleanDest('build'))
        .pipe(gulp.dest('build'));

    // Javascript files
    gulp.src('src/js/*')
        .pipe(cleanDest('build/js'))
        .pipe(gulp.dest('build/js'));

    // Vendor Files
    gulp.src('src/vendor/**/*')
        .pipe(cleanDest('build/vendor'))
        .pipe(gulp.dest('build/vendor'));

    // Angular Views
    gulp.src('src/views/*')
        .pipe(cleanDest('build/views'))
        .pipe(gulp.dest('build/views'));

});


gulp.task('less', function() {
    gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(concat('all.css'))
        .pipe(cleanDest('build/css'))
        .pipe(gulp.dest('build/css'));
});

gulp.task('watch', function() {
    var watcher,
        filename;
    
    watcher = gulp.watch('levsdelight_app/static/src/less/*.less', ['less']);
    watcher.on('change', function(event) {
        filename = event.path.split('/').pop();
        console.log('File ' + filename + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default', ['copy', 'less', 'watch']);
