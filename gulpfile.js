const gulp = require('gulp'),
	runSequence = require('run-sequence'),
	util = require('gulp-util'),
	plumber = require('gulp-plumber'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	del = require('del'),
	gulpFilter = require('gulp-filter'),
	mainBowerFiles = require('main-bower-files'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	eslint = require('gulp-eslint'),
	karmaServer = require('karma').Server,
	mocha = require('gulp-mocha'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec;
let node,
	mongo;

function killProcessByName(name){
	exec('ps -e | grep ' + name, (error, stdout, stderr) => {
		if (error) throw error;
		if (stderr) console.log('stderr:', stderr);
		if (stdout) {
			const runningProcessesIDs = stdout.match(/\d{4}/);
			runningProcessesIDs.forEach((id) => {
				exec('kill -9 ' + id, (error, stdout, stderr) => {
					if (error) throw error;
					if (stderr) console.log('stdout:', stdout);
					if (stdout) console.log('stderr:', stderr);
				});
			});
		}
	});
}
gulp.task('database', () => {
	if (mongo) mongo.kill();
	mongo = spawn('npm', ['run','mongo-start'], {stdio: 'inherit'});
	mongo.on('close', (code) => {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
});
gulp.task('server', () => {
	if (node) node.kill();
	node = spawn('node', ['server.js'], {stdio: 'inherit'});
	node.on('close', (code) => {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('server-test', () => {
	return gulp.src(['test/unit/server.test.js'], { read: false })
		.pipe(mocha({ reporter: 'nyan' }))
		.once('error', util.log)
		.once('end', () => {
			console.log('server test finished');
			//process.exit();
		});
});
gulp.task('client-unit-test', (done) => {
	new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		autoWatch: false,
		singleRun: true
	}, () => {
		console.log('done');
		done();
	}).start();
});

/* vendor pack */
gulp.task('bower-files', () => {
	/*
	*	notice
	*	jquery is added to vendor pack manually,
	*	because it is concatenated with other js files in wrong turn in auto mode,
	*	it should be added first
	*/
	const filterJS = gulpFilter(['**/*.js', '!./client/bower_components/jquery/**'], { restore: true });
	return gulp.src(['./client/bower_components/jquery/dist/jquery.js'].concat(mainBowerFiles(
		{
			paths: {
				bowerJson: './bower.json',
				bowerrc: './.bowerrc'
			}
		})))
		.pipe(filterJS)
		.pipe(plumber())
		.pipe(concat('vendor-pack.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('vendor-pack.min.js'))
		.pipe(filterJS.restore)
		.pipe(gulp.dest('./client/js'));
});
gulp.task('pack-vendor-css', () => { // packs vendor css files which bowerFiles put into client/js folder on bower-files task execution
	return gulp.src('./client/js/*.css')
		.pipe(plumber())
		.pipe(concat('vendor-pack.css'))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('vendor-pack.min.css'))
		.pipe(gulp.dest('./client/css'));
});
gulp.task('move-vendor-fonts', () => { // move vendor font files which bowerFiles puts into client/fonts folder on bower-files task execution
	return gulp.src(['./client/js/*.otf', './client/js/*.eot', './client/js/*.svg', './client/js/*.ttf', './client/js/*.woff', './client/js/*.woff2'])
		.pipe(gulp.dest('./client/fonts'));
});
gulp.task('build-clean', () => { // remove vendor css and fonts from client/js
	return del(['./client/js/*.css', './client/js/*.otf', './client/js/*.eot', './client/js/*.svg', './client/js/*.ttf', './client/js/*.woff', './client/js/*.woff2']);
});

/* application pack */
gulp.task('concat-and-uglify-js', () => {
	return gulp.src(['./client/app.js', './client/components/**/*.js', './client/views/**/*.js', '!./client/components/**/*_test.js', '!./client/views/**/*_test.js'])
		.pipe(plumber())
		.pipe(concat('packed-app.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.js'))
		.pipe(gulp.dest('./client/js'));
});
gulp.task('sass-autoprefix-minify-css', () => {
	return gulp.src('./client/css/*.scss')
		.pipe(plumber())
		.pipe(concat('packed-app.css'))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.css'))
		.pipe(gulp.dest('./client/css'));
});

gulp.task('lint', () => {
	return gulp.src(['./server/**/*.js', 'client/components/*.js', 'client/components/**/*.js', 'client/views/**/*.js', './*.js']) // uses ignore list from .eslintignore
		.pipe(eslint('./.eslintrc.json'))
		.pipe(eslint.format());
});

gulp.task('test', () => {
	gulp.watch(['server/**/*.js', 'server.js', 'test/unit/server.test.js'], ['server-test']);
	gulp.watch(['client/app.js', 'client/components/*.js', 'client/components/**/*.js', 'client/views/**/*.js'], ['client-unit-test']);
});

gulp.task('watch-and-lint', () => {
	gulp.watch(['./server/**/*.js', 'client/*.js', 'client/**/*.js', './*.js', './.eslintignore', './.eslintrc.json'], ['lint']);
});

gulp.task('watch', () => {
	gulp.watch(['./server.js', './server/config/*.js', './server/routes/*.js', './server/reporter/*.js'], ['server']);
	gulp.watch(['./server.js', './server/models/*.js'], ['database']);
	gulp.watch(['server/routes/*.js', 'server/reporter/*.js', 'server.js', 'test/unit/server.test.js'], ['server-test']);
	gulp.watch(['client/app.js', 'client/components/*.js', 'client/components/**/*.js', 'client/views/**/*.js'], ['client-unit-test']);
	gulp.watch(['./client/app.js', './client/components/**/*.js', './client/views/**/*.js', '!./client/components/**/*_test.js', '!./client/views/**/*_test.js'], ['concat-and-uglify-js']);
	gulp.watch('./client/css/*.scss', ['sass-autoprefix-minify-css']);
	gulp.watch(['./server/**', './client/**', './*.js', './.eslintignore', './.eslintrc.json'], ['lint']);
});

gulp.task('build', (done) => {
	runSequence('bower-files', 'pack-vendor-css', 'move-vendor-fonts', 'build-clean', 'concat-and-uglify-js', 'sass-autoprefix-minify-css', done);
});

gulp.task('default', (done) => {
	runSequence('database','server', 'build', 'watch', done);
});

process.on('exit', () => {
	if (node) node.kill();
	if (mongo) mongo.kill();
});

process.on('SIGINT', () => {
	killProcessByName('gulp');
});
