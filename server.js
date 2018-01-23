'use strict';

const express = require('express'),
	routes = require('./server/routes/index.js'),
	reporter = require('./server/reporter/index.js'),
	reporterSingleRun = require('./server/reporter/index-single-run.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	session = require('express-session'),
	MongoStore = require('connect-mongodb-session')(session),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	fs = require('fs'),
	app = express(),
	expressWs = require('express-ws')(app), // eslint-disable-line no-unused-vars
	flash = require('connect-flash'),
	jwt = require('jwt-simple'),
	nodemailer = require('nodemailer'),
	schedule = require('node-schedule'),
	json2csv = require('json2csv'),
	cluster = require('cluster'),
	os = require('os');
let clusterStop = false;

if (!process.env.OPENSHIFT_MONGODB_DB_HOST) {
	require('dotenv').load();
}
require('./server/config/passport')(passport);

const mongo_uri = process.env.MONGO_URI || 'mongodb://'+process.env.MONGO_USR+':'+process.env.MONGO_PASS+process.env.OPENSHIFT_MONGODB_DB_HOST+':'+process.env.OPENSHIFT_MONGODB_DB_PORT+'/ng1nmc';
mongoose.connect(mongo_uri);
const Account = require('./server/models/accounts'),
	Entrant = require('./server/models/entrants'),
	DataInit = require('./server/utils/data-init.js'),
	SrvInfo = require('./server/utils/srv-info.js');

// set process title to be able to terminate the process directly
process.title = 'ng1nmc';

app.use('/', express.static(process.cwd() + '/client'));
if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
	const store = new MongoStore({
		uri: mongo_uri,
		collection: 'clientSessions'
	});
	app.use(session({secret:'secretNG1NMC', resave:false, saveUninitialized:true, store: store , cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day 
	} }));
}else{
	app.use(session({ secret: 'secretNG1NMC', resave: false, saveUninitialized: true }));
}
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

// CORS headers
app.all('/*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	res.header('Access-Control-Expose-Headers', 'userTokenUpdate');
	if (req.method == 'OPTIONS') res.status(200).end();
	else next();
});

/*
* nodemailer usage notice:
* To use Gmail you may need to configure "Allow Less Secure Apps" (https://www.google.com/settings/security/lesssecureapps)
* in your Gmail account unless you are using 2FA
* in which case you would have to create an Application Specific password (https://security.google.com/settings/security/apppasswords).
* You also may need to unlock your account with "Allow access to your Google account" (https://accounts.google.com/DisplayUnlockCaptcha)
* to use SMTP.
*/
let smtpConfig = {
	host: process.env.MAILER_HOST,
	port: process.env.MAILER_PORT,
	secure: true, // use SSL
	auth: {
		type: 'OAuth2',
		user: process.env.MAILER_EMAIL,
		clientId: process.env.MAILER_CLIENT_ID,
		clientSecret: process.env.MAILER_CLIENT_SECRET,
		refreshToken: process.env.MAILER_REFRESH_TOKEN,
		accessToken: 'empty'
	}
};
let isDevEnvironment = false; // this variable is needed to set proper failureRedirect paths for application routes
// set proxy for smtp for development environment
if (process.env.HOME.indexOf('ruser') != -1) {
	console.log('development environment launch detected, setting proxy for smtpConfig');
	smtpConfig.proxy = 'socks5://127.0.0.1:9150/';
	isDevEnvironment = true;
}

const mailTransporter = nodemailer.createTransport(smtpConfig); // reusable transporter object using the default SMTP transport
mailTransporter.verify((err, success) => {
	if (err) {
		console.log('Mail transporter diag error >>', err);
	} else {
		console.log('Mail transporter diag success >>', success);
	}
});

routes(app,passport,crypto,jwt,Account,Entrant,SrvInfo,DataInit,mailTransporter, reporterSingleRun, isDevEnvironment);

reporter(fs,Entrant,schedule,json2csv,mailTransporter);

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
	ip = process.env.OPENSHIFT_NODEJS_IP; // "127.0.0.1" is not specified here on purpose, this env var should be included in .openshift.env

function terminator(sig) {
	if (typeof sig === 'string') {
		console.log('%s: Received %s - terminating app ' + sig + '...', Date(Date.now()));
		if (cluster.isMaster && !clusterStop) {
			cluster.fork();
		}else{
			process.exit(0);
			if (!cluster.isMaster) { console.log('%s: Node server stopped', Date(Date.now())); }
		}
	}
}

if (!ip){
	/*
	*   development
	*/
	app.listen(port, () => {
		console.log('$> development > Node.js listening on port ' + port + '...');
	});
}else{
	/*
	*   deployment - OPENSHIFT SPECIFIC
	*/
	(() => {
		/*
		*   termination handlers
		*/
		process.on('exit', () => { terminator('exit'); });
		// Removed 'SIGPIPE' from the list - bugz 852598.
		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
			'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
		].forEach((element) => {
			process.on(element, () => {
				clusterStop = true;
				terminator(element);
			});
		});
	})();

	if (cluster.isMaster) {
		const workersCount = os.cpus().length;
		console.log('%s: Node.js listening on ' + ip + ':' + port + '...');
		console.log('Cluster setup, workers count:',workersCount);
		for (let i = 0; i < workersCount; i++) {
			console.log('Starting worker',i);
			cluster.fork();
		}
		cluster.on('online', (worker,error) => {
			if (error) throw error;
			console.log('Worker pid',worker.process.pid,'is online');
		});
		cluster.on('exit', (worker, code, signal) => {
			console.log('Worker pid',worker.process.pid,'exited with code',code,'and signal',signal);
			if (!clusterStop) {
				console.log('Starting a new worker...');
				cluster.fork();
			}
		});
	}else{
		app.listen(port, ip, () => {
			console.log('%s: Node.js listening on ' + ip + ':' + port + '...');
		});
	}
}
