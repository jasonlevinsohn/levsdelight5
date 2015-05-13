var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var cleanDest = require('gulp-clean-dest');
var less = require('gulp-less');


gulp.task('clean', function() {
    gulp.src('build/')
        .pipe(clean());

});

// Copy index file
gulp.task('copy-index', function() {

    gulp.src('index.html')
        .pipe(cleanDest('build'))
        .pipe(gulp.dest('build'));

});

// Copy Angular Views
gulp.task('copy-views', function() {

    gulp.src('src/views/*')
        .pipe(cleanDest('build/views'))
        .pipe(gulp.dest('build/views'));
    
});

// Copy app javascript files
gulp.task('copy-js', function() {

    gulp.src('src/js/*')
        .pipe(cleanDest('build/js'))
        .pipe(gulp.dest('build/js'));

    
});

gulp.task('copy', function() {

    // Vendor Files
    gulp.src('src/vendor/**/*')
        .pipe(cleanDest('build/vendor'))
        .pipe(gulp.dest('build/vendor'));

});


gulp.task('less', function() {
    gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(concat('all.css'))
        .pipe(cleanDest('build/css'))
        .pipe(gulp.dest('build/css'));
});

gulp.task('watch', function() {
    var lessWatcher,
        lessFilename,
        indexWatcher,
        indexFilename,
        viewsWatcher,
        viewsFilename,
        jsWatcher,
        jsFilename;
    

    // Less Watcher
    lessWatcher = gulp.watch('src/less/*.less', ['less']);
    lessWatcher.on('change', function(event) {
        lessFilename = event.path.split('/').pop();
        console.log('Less File ' + lessFilename + ' was ' + event.type + ', compiling new less...');
    });

    // Index File Watcher
    indexWatcher = gulp.watch('index.html', ['copy-index']);
    indexWatcher.on('change', function(event) {
        indexFilename = event.path;
        console.log(indexFilename + ' was ' + event.type + ', copying new file...');
    });

    //Angular Views Watcher
    viewsWatcher = gulp.watch('src/views/*', ['copy-views']);
    viewsWatcher.on('change', function(event) {
        viewsFilename = event.path.split('/').pop();
        console.log(viewsFilename + ' was ' + event.type + ', copying new files...');
    });

    jsWatcher = gulp.watch('src/js/*', ['copy-js']);
    jsWatcher.on('change', function(event) {
        jsFilename = event.path.split('/').pop();
        console.log(jsFilename + ' was ' + event.type + ', copying new files...');
    });
});

gulp.task('default', ['copy-views', 'copy-index', 'copy-js', 'copy', 'less', 'watch']);
