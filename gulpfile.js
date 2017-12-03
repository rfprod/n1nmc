'use strict';

const gulp = require('gulp'),
	runSequence = require('run-sequence'),
	util = require('gulp-util'),
	plumber = require('gulp-plumber'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	eslint = require('gulp-eslint'),
	karmaServer = require('karma').Server,
	mocha = require('gulp-mocha'),
	del = require('del'),
	spawn = require('child_process').spawn,
	exec = require('child_process').exec;
let node,
	mongo,
	protractor;

function killProcessByName(name){
	exec('pgrep ' + name, (error, stdout, stderr) => {
		if (error) {
			// throw error;
			console.log('killProcessByName, error', error);
		}
		if (stderr) console.log('stderr:', stderr);
		if (stdout) {
			const runningProcessesIDs = stdout.match(/\d+/);
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
gulp.task('database', (done) => {
	if (mongo) mongo.kill();
	mongo = spawn('npm', ['run','mongo-start'], {stdio: 'inherit'});
	mongo.on('close', (code) => {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
	done();
});
gulp.task('server', (done) => {
	if (node) node.kill();
	node = spawn('node', ['server.js'], {stdio: 'inherit'});
	node.on('close', (code) => {
		if (code === 8) {
			gulp.log('Error detected, waiting for changes...');
		}
	});
	done();
});

gulp.task('server-test', (done) => {
	return gulp.src(['test/unit/server.test.js'], { read: false })
		.pipe(mocha({ reporter: 'nyan' }))
		.once('error', util.log)
		.once('end', () => {
			console.log('server test finished');
			done();
		});
});
gulp.task('client-unit-test', (done) => {
	new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		autoWatch: true,
		singleRun: false
	}, () => {
		console.log('done');
		done();
	}).start();
});
gulp.task('client-unit-test-single-run', (done) => {
	new karmaServer({
		configFile: require('path').resolve('test/karma.conf.js'),
		singleRun: true
	}, () => {
		console.log('done');
		done();
	}).start();
});

gulp.task('client-e2e-test', (done) => {
	if (protractor) protractor.kill();
	protractor = spawn('npm', ['run', 'protractor'], {stdio: 'inherit'});
	protractor.on('exit', (exitCode) => {
		console.log('Protractor done, exited with code', exitCode);
		done();
	});
});

gulp.task('clean-build', () => {
	return del(['./app/css/*.css', './app/js/*.js', './app/fonts/*.otf', './app/fonts/*.eot', './app/fonts/*.svg', './app/fonts/*.ttf', './app/fonts/*.woff', './app/fonts/*.woff2']);
});

/* application pack */
gulp.task('pack-app-js', () => {
	return gulp.src(['./client/app.js', './client/components/**/*.js', './client/views/**/*.js', '!./client/components/**/*_test.js', '!./client/views/**/*_test.js'])
		.pipe(plumber())
		.pipe(concat('packed-app.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('packed-app.min.js'))
		.pipe(gulp.dest('./client/js'));
});
gulp.task('pack-app-css', () => {
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

/* vendor pack */
gulp.task('pack-vendor-js', () => {
	return gulp.src([
		/*
		*	add third party js files here
		*
		*	sequence is essential
		*/
		'./node_modules/jquery/dist/jquery.js',
		'./node_modules/bootstrap/dist/js/bootstrap.js',
		'./node_modules/bootstrap-toggle/js/bootstrap-toggle.js',
		'./node_modules/moment/moment.js', // required by datetimepicker
		'./node_modules/d3/d3.js', // required by angular-nvd3, included below
		'./node_modules/nvd3/build/nv.d3.js', // required by angular-nvd3, included below

		'./node_modules/angular/angular.js',
		'./node_modules/oclazyload/dist/ocLazyLoad.js',
		'./node_modules/angular-animate/angular-animate.js',
		'./node_modules/angular-aria/angular-aria.js',
		'./node_modules/angular-cookies/angular-cookies.js',
		'./node_modules/angular-loader/angular-loader.js',
		'./node_modules/angular-messages/angular-messages.js',
		'./node_modules/angular-mocks/angular-mocks.js',
		'./node_modules/angular-nvd3/dist/angular-nvd3.js',
		'./node_modules/angular-resource/angular-resource.js',
		'./node_modules/angular-route/angular-route.js',
		'./node_modules/angular-sanitize/angular-sanitize.js',
		'./node_modules/angular-spinner/dist/angular-spinner.js',
		'./node_modules/angular-touch/angular-touch.js',
		'./node_modules/angular-translate/dist/angular-translate.js',
		'./node_modules/angular-ui-router/release/angular-ui-router.js',
		'./node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
		'./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
		'./node_modules/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
		'./node_modules/angular-bootstrap-datetimepicker/src/js/datetimepicker.templates.js',
		'./node_modules/angular-websocket/dist/angular-websocket.js'
	])
		.pipe(plumber())
		.pipe(concat('vendor-pack.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename('vendor-pack.min.js'))
		.pipe(gulp.dest('./client/js'));
});
gulp.task('pack-vendor-css', () => {
	return gulp.src([
		/*
		*	add third party css files here
		*/
		'./node_modules/bootstrap/dist/css/bootstrap.css',
		'./node_modules/bootstrap/dist/css/bootstrap-theme.css',
		'./node_modules/bootstrap-toggle/css/bootstrap-toggle.min.css',
		'./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
		'./node_modules/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
		'./node_modules/nvd3/dist/nv.d3.css',
		'./node_modules/font-awesome/css/font-awesome.css'
	])
		.pipe(plumber())
		.pipe(concat('vendor-pack.css'))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename('vendor-pack.min.css'))
		.pipe(gulp.dest('./client/css'));
});
gulp.task('move-vendor-fonts', () => {
	return gulp.src([
		/*
		*	add third party fonts here
		*/
		'./node_modules/bootstrap/dist/fonts/*.*',
		'./node_modules/font-awesome/fonts/*.*'
	])
		.pipe(gulp.dest('./client/fonts'));
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
	gulp.watch(['./client/app.js', './client/components/**/*.js', './client/views/**/*.js', '!./client/components/**/*_test.js', '!./client/views/**/*_test.js'], ['pack-app-js']);
	gulp.watch('./client/css/*.scss', ['pack-app-css']);
	gulp.watch(['./server/**', './client/**', './*.js', './.eslintignore', './.eslintrc.json'], ['lint']);
});

gulp.task('build', (done) => {
	runSequence('pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts', 'clean-build', 'pack-app-js', 'pack-app-css', done);
});

gulp.task('default', (done) => {
	runSequence('database','server', 'build', 'watch', done);
});

gulp.task('production-start', (done) => {
	runSequence('database','server', 'build', done);
});

process.on('exit', () => {
	if (node) node.kill();
	if (mongo) mongo.kill();
});

process.on('SIGINT', () => {
	killProcessByName('gulp');
});
