//jshint strict: false
exports.config = {

	directConnect: false,

	chromeOnly: false,

	allScriptsTimeout: 11000,

	specs: [
		'*.js'
	],

	capabilities: {
		//'browserName': 'chrome'
		'browserName': 'phantomjs',
		'phantomjs': {
			'binary': {
				'path': require('phantomjs-prebuilt').path
			},
			'ghostdriver': {
				'cli': {
					'args': ['--loglevel=DEBUG']
				}
			}
		}
	},

	baseUrl: 'http://localhost:8080/',

	framework: 'jasmine',

	jasmineNodeOpts: {
		defaultTimeoutInterval: 30000
	}

};
