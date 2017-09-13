'use strict';

module.exports = (app, passport, crypto, jwt, Account, Entrant, SrvInfo, DataInit, mailTransporter, reporterSingleRun, isDevEnvironment) => {

	/*
	*	check if data init is needed
	*	data is initialized with dummy data if the DB is empty on server start
	*/
	DataInit.initData();
	/*
	* JWT methods
	*/
	function generateJWToken(payload, storedSalt) {
		let salt, token;
		if (storedSalt) salt = storedSalt;
		else salt = crypto.randomBytes(24).toString('hex');
		token = jwt.encode(payload, salt, 'HS256'); // HS256, HS384, HS512, RS256.
		return { token: token, salt: salt };
	}
	function decryptJWToken(token, storedSalt) {
		if (!token || !storedSalt) return false;
		return jwt.decode(token, storedSalt, 'HS256'); // HS256, HS384, HS512, RS256.
	}
	function checkJWTokenExpiration(token, renewTimeFringe, callback) {
		Account.find({'jwToken': token}, (err,docs) => {
			if (err) throw err;
			let tokenStatus = { expired: false, renew: false },
				currentTime = new Date().getTime();
			if (docs.length > 0) {
				let storedSalt = docs[0].salt;
				let payload = decryptJWToken(token, storedSalt);
				console.log(payload);
				console.log(payload.expires, currentTime, payload.expires - currentTime);
				if (parseInt(payload.expires,10) <= currentTime) tokenStatus.expired = true;
				else if ((parseInt(payload.expires,10) - currentTime) <= renewTimeFringe) tokenStatus.renew = true;
				else console.log('token status: ok');
			}
			callback(tokenStatus);
		});
	}
	function updateAccountLastLogin(jwToken) { // last login is updated every time a user account get jwToken update
		if (jwToken) {
			Account.update({jwToken:jwToken}, {$set: {'lastLogin': new Date().getTime()}}, (err, doc) => {
				if (err) throw err;
				console.log('updated last log in:', JSON.stringify(doc));
			});
		} else return false;
	}
	function setUserJWToken(id, tokenObj, callback) {
		Account.update({_id: id}, {$set:{'jwToken':tokenObj.token,'salt':tokenObj.salt}}, (err,dt) => {
			if (err) throw err;
			console.log('set user jwToken:', JSON.stringify(dt));
			updateAccountLastLogin(tokenObj.token);
			callback();
		});
	}
	function updateUserJWToken(currentToken, newTokenObj) {
		Account.update({'jwToken': currentToken}, {$set:{'jwToken':newTokenObj.token,'salt':newTokenObj.salt}}, (err,dt) => {
			if (err) throw err;
			console.log('update user jwToken:', JSON.stringify(dt));
			updateAccountLastLogin(newTokenObj.token);
		});
	}
	function resetUserJWToken(id, callback) {
		Account.update({_id: id}, {$set:{'jwToken':'','salt':''}}, (err,dt) => {
			if (err) throw err;
			console.log('reset user jwToken:', JSON.stringify(dt));
			callback();
		});
	}
	function renewUserToken(req, callback) {
		let userToken = req.query.user_token; // get toke from url var
		if (typeof userToken == 'undefined') userToken = req.body.user_token; // get token from request body
		let storedSalt = null,
			expirationDate = new Date();
		console.log('current userToken: ', userToken);
		Account.find({'jwToken': userToken}, (err, docs) => {
			if (err) throw err;
			let user = docs[0];
			if (user.salt != '') storedSalt = user.salt;
			expirationDate.setDate(expirationDate.getDate() + 7);
			let payload = {
				id: user.id,
				login: user.login,
				email: user.email,
				role: user.role,
				expires: expirationDate.getTime() // expires in one week
			};
			let tokenObj = generateJWToken(payload, storedSalt);
			callback(tokenObj);
		});
	}
	function reportRenewedTokenToUser(req,res) {
		let userToken = req.query.user_token; // get toke from url var
		if (typeof userToken == 'undefined') userToken = req.body.user_token; // get token from request body
		//console.log('current user token: '+userToken);
		if (req.renewedTokenObj) { // set header if user token has been renewed - this token should be used for subsequent request
			res.header('userTokenUpdate', req.renewedTokenObj.token);
			//console.log(req.renewedTokenObj);
			updateUserJWToken(userToken, req.renewedTokenObj);
		}
	}

	/*
	* password reset methods
	*/
	function generateDerivate(password, storedSalt) {
		let salt, derivate, obj;
		if (storedSalt) salt = storedSalt;
		else salt = crypto.randomBytes(24).toString('hex');
		derivate = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512').toString('hex');
		obj = { derivate: derivate, salt: salt };
		return obj;
	}
	function updateUserPassResetToken(id, derivateObj, callback) {
		Account.update({id: id}, {$set:{'resetToken':derivateObj.derivate,'salt':derivateObj.salt}}, (err,result) => {
			if (err) throw err;
			console.log('updated password reset token for user id '+id+' :',result);
			callback();
		});
	}
	function resetUserPassResetTokenAndUpdatePass(id, newPass, callback) {
		Account.update({id: id}, {$set:{'resetToken':'', 'password':newPass}}, (err,result) => {
			if (err) throw err;
			console.log('reset user password for user id '+id+' :',result);
			callback();
		});
	}

	/*
	* email methods
	*
	*	TODO
	*	should be reconfigured to send invitations by email for entrants, too
	*/
	let mailOptions = {};
	function sendEmailGreeting(recipientEmail, password) {
		mailOptions = {
			from: '"appCore 👥" <'+process.env.MAILER_EMAIL+'>', // sender address
			to: recipientEmail, //'bar@blurdybloop.com, baz@blurdybloop.com', // accepts list of receivers
			subject: 'appCore: приветствие ✔', // Subject line
			text: 'appCore: Ваша учётная запись создана. Используйте для входа адрес '+recipientEmail+' и пароль '+password+'.', // plaintext body
			html: '<h3>appCore: Ваша учётная запись создана.</h3><p>Используйте для входа адрес '+recipientEmail+' и пароль '+password+'.</p>' // html body
		};
		mailTransporter.sendMail(mailOptions, function(err, info) {
			if(err) {return console.log(err);}
			console.log('Message sent: ' + info.response);
		});
	}
	function sendEmailPasswordReset(recipientEmail, resetLink) {
		mailOptions = {
			from: '"appCore 👥" <'+process.env.MAILER_EMAIL+'>',
			to: recipientEmail,
			subject: 'appCore: ссылка для сброса вашего пароля ✔',
			text: 'appCore: Сброс вашего пароля.\nДля создания нового пароля для учётной записи, соответствующей адресу '+recipientEmail+' перейдите по ссылке: '+resetLink+'.\nНовый пароль будет выслан на адрес: '+recipientEmail+'.', // plaintext body
			html: '<h3>appCore: Сброс вашего пароля.</h3><p>Для создания нового пароля для учётной записи, соответствующей адресу '+recipientEmail+' перейдите по ссылке: '+resetLink+'.</p><p>Новый пароль будет выслан на адрес: '+recipientEmail+'.</p>' // html body
		};
		mailTransporter.sendMail(mailOptions, function(err, info) {
			if(err) {return console.log(err);}
			console.log('Message sent: ' + info.response);
		});
	}
	function sendEmailNewPassword(recipientEmail, password) {
		mailOptions = {
			from: '"appCore 👥" <'+process.env.MAILER_EMAIL+'>',
			to: recipientEmail,
			subject: 'appCore: ваш новый пароль ✔',
			text: 'appCore: Ваш новый пароль.\nВаш новый пароль '+password+'.', // plaintext body
			html: '<h3>appCore: Ваш новый пароль.</h3><p>Ваш новый пароль '+password+'.</p>' // html body
		};
		mailTransporter.sendMail(mailOptions, function(err, info) {
			if(err) {return console.log(err);}
			console.log('Message sent: ' + info.response);
		});
	}
	function sendEmailReport(recipientEmail, plainTextReport, htmlReport, attachmentPath, callback){
		if (attachmentPath) {
			mailOptions = {
				from: '"Генератор отчётов appCore 👥" <'+process.env.MAILER_EMAIL+'>',
				to: recipientEmail,
				subject: 'appCore: Промежуточный отчёт ✔',
				text: 'appCore: Промежуточный отчёт.\n\n'+plainTextReport,
				html: '<h3>appCore: Промежуточный отчёт.</h3>'+htmlReport,
				attachments: [{ path: attachmentPath }]
			};
		}else {
			mailOptions = {
				from: '"Генератор отчётов appCore 👥" <'+process.env.MAILER_EMAIL+'>',
				to: recipientEmail,
				subject: 'appCore: Промежуточный отчёт ✔',
				text: 'appCore: Промежуточный отчёт.\n\n'+plainTextReport,
				html: '<h3>appCore: Промежуточный отчёт.</h3>'+htmlReport
			};
		}
		mailTransporter.sendMail(mailOptions, function(err, info){
			if (err) {
				callback({error: 'Mail transporter error' });
				return console.log('Mail transporter error: ', err);
			}
			console.log('Message sent: ', info.response);
			callback({success: info.response});
		});
	}

	let failureRedirectPath = '/loginerror';

	/*
	* generate user token
	*/
	app.route('/login').post(passport.authenticate('local', { failureRedirect: failureRedirectPath, failureFlash: true }), (req, res) => {
		console.log('login');
		let userEmail = req.body.email,
			userPassword = req.body.password;
		console.log('userEmail:', userEmail, 'userPassword:', userPassword);
		let user = req.user,
			storedSalt = null,
			expirationDate = new Date();
		if (user.salt != '') storedSalt = user.salt;
		expirationDate.setDate(expirationDate.getDate() + 7); // expires in one week
		let payload = {
			id: user.id,
			login: user.login,
			email: user.email,
			role: user.role,
			expires: expirationDate.getTime()
		};
		let tokenObj = generateJWToken(payload, storedSalt);
		console.log(payload, tokenObj);
		setUserJWToken(user._id, tokenObj, () => {
			req.logout(); // user session is closed before getting jwToken
			res.json({token: tokenObj.token});
		});
	});
	/*
	* revoke user token
	*/
	app.get('/logout', passport.authenticate('token-bearer', { failureRedirect: failureRedirectPath, failureFlash: true, session: false }), (req, res) => { // set failureRedirect path dynamically
		console.log('logout');
		let user = req.user;
		resetUserJWToken(user._id, () => {
			res.json({success: 'Logged out'});
		});
	});
	/*
	* report /login and /logout errors
	*/
	app.route('/loginerror').get((req, res) => {
		console.log('login error');
		res.status(401);
		if (req.session.flash) res.json({ error: req.session.flash.error[req.session.flash.error.length-1] });
		else res.json({error: 'Not logged in'});
	});

	/*
	* reset pass by token and get new one
	*/
	app.get('/getpass', (req,res) => {
		console.log('reset user password');
		let query = req.query,
			responseMessage = {};
		let redirectUrl = req.protocol+'://'+req.headers.host;
		if (isDevEnvironment) redirectUrl = 'http://localhost:8080';
		if (query.reset_token) {
			console.log('reset token',query.reset_token);
			Account.find({resetToken:query.reset_token}, (err,doc) => {
				if (err) throw err;
				if (doc.length > 0) {
					let newPassword = crypto.randomBytes(4).toString('hex');
					console.log(newPassword);
					resetUserPassResetTokenAndUpdatePass(doc[0].id, newPassword, () => {
						responseMessage.success = 'Новый пароль от вашей учётной записи был отправлен на ваш адрес электронной почты.<br><br>Вы будете автоматически перенаправлены на страницу входа в систему через <span>10</span> секунд.<br><br>Также, для перехода вы можете воспользоваться <a href=\''+redirectUrl+'\'>ссылкой</a>.';
						console.log(responseMessage);
						let html = '<html><head><script>var timer = setTimeout(function() {window.location="'+redirectUrl+'";},10000); var time = 10; setInterval(function() {document.querySelector("span").innerHTML = --time;},1000);</script></head><body>'+responseMessage.success+'</body></html>';
						res.send(html);
						sendEmailNewPassword(doc[0].email,newPassword);
					});
				} else {
					responseMessage.error = 'Invalid token';
					console.log(responseMessage);
					res.status(401).json(responseMessage);
				}
			});
		} else {
			responseMessage.error = 'Token missing \'reset_token\'';
			console.log(responseMessage);
			res.status(401).json(responseMessage);
		}
	});

	/*
	*	jwt middleware for api endpoints authentication
	*/
	app.all('/api/*', function(req, res, next) {
		passport.authenticate('token-bearer', { session: false }, function(err, user, info) {
			const renewTimeFringe = 518400000; // every 24 hours
			//const renewTimeFringe = 604750000; // almost immediately
			let userToken = req.query.user_token; // token from url var
			if (typeof userToken == 'undefined') userToken = req.body.user_token; // token from request body
			if (userToken) {
				checkJWTokenExpiration(userToken, renewTimeFringe, (tokenStatus) => {
					req.renewedToken = false;
					console.log('token status:', tokenStatus);
					if (tokenStatus.expired) return res.status(401).json({ error: 'token expired' });
					//if (tokenStatus.renew) return res.status(200).json({ to_be_configured: 'this event should regenerate user token' });
					if (tokenStatus.renew) {
						renewUserToken(req, (tokenObj) => {
							console.log('new token:', tokenObj);
							req.renewedTokenObj = tokenObj;
							return next();
						});
					}
					else if (info.statusCode == 200) return next();
					else if (!info.statusCode) return res.status(401).json({ error: info });
					else return res.status(info.statusCode).json({ error: info.message });
				});
			} else {
				const responseMessage = {error: 'Token missing \'user_token\''};
				console.log('responseMessage:', responseMessage);
				res.status(401).json(responseMessage);
			}
		})(req,res);
	});

// Users

	app.get('/api/users/me', (req, res) => {
		console.log('logged in user details');
		/*
		* requires auth (user or admin)
		*/
		let userToken = req.query.user_token;
		Account.find({jwToken: userToken}, (err, docs) => {
			if (err) throw err;
			let response = [];
			if (docs.length == 0) {
				console.log('user does not exist');
				response = {error: 'user does not exist'};
			} else {
				console.log('user exists');
				for (let doc of docs) {
					response.push({
						id: doc.id,
						login: doc.login,
						email: doc.email,
						firstName: doc.firstName,
						lastName: doc.lastName,
						role: doc.role,
						lastLogin: (doc.lastLogin) ? doc.lastLogin : null
					});
				}
			}
			reportRenewedTokenToUser(req,res);
			res.json(response);
		});
	});

	app.post('/api/users/me/update', (req, res) => {
		console.log('update self');
		/*
		* requires auth (user, owner)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isOwner = false,
				notFound = true,
				postParamsMissing = false,
				currentValues = null;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token && doc.id == postParams.id) {
					isOwner = true;
				}
				if (doc.id == postParams.id) {
					notFound = false;
					currentValues = doc;
				}
			}
			console.log('current values:', currentValues);
			console.log('post params:', postParams);
			if (typeof postParams.id == 'undefined') postParamsMissing = true;
			console.log('isOwner:', isOwner);
			console.log('postParamsMissing:', postParamsMissing);
			if (isOwner && !postParamsMissing && !notFound) {
				console.log('updating user id:', postParams.id);
				Account.update({id: postParams.id}, {$set: {
					login: (postParams.email) ? postParams.email.substring(0,postParams.email.indexOf('@')) : currentValues.login,
					email: (postParams.email) ? postParams.email : currentValues.email,
					firstName: (postParams.firstName) ? postParams.firstName : currentValues.firstName,
					lastName: (postParams.lastName) ? postParams.lastName : currentValues.lastName,
					role: (postParams.role) ? postParams.role : currentValues.role
				}}, (err, result) => {
					if (err) throw err;
					reportRenewedTokenToUser(req,res);
					console.log('update self by id', postParams.id, ':', result);
					res.json({success: 'User with id '+postParams.id+' updated self'});
				});
			} else {
				let message = [];
				if (!isOwner) message.push('Permission denied');
				if (postParamsMissing) message.push('Missing mandatory request params');
				if (notFound) message.push('User with id '+postParams.id+' was not found');
				res.status(401).json({error: message});
			}
		});
	});

	app.post('/api/users/me/changepass', (req, res) => {
		console.log('change self password');
		/*
		* requires auth (user, owner)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isOwner = false,
				notFound = true,
				postParamsMissing = false,
				wrongCurrentPassword = true,
				currentValues = null;
			for (let doc of docs) {
				if (doc.jwToken === postParams.user_token && doc.id == postParams.id) {
					isOwner = true;
					if (doc.password === postParams.currentPass) {
						wrongCurrentPassword = false;
					}
				}
				if (doc.id == postParams.id) {
					notFound = false;
					currentValues = doc;
				}
			}
			console.log('current values:', currentValues);
			console.log('post params:', postParams);
			if (typeof postParams.id == 'undefined' || typeof postParams.currentPass == 'undefined' || typeof postParams.newPass == 'undefined' ) postParamsMissing = true;
			console.log('isOwner:', isOwner);
			console.log('wrongCurrentPassword:', wrongCurrentPassword);
			console.log('postParamsMissing:', postParamsMissing);
			if (isOwner && !postParamsMissing && !notFound && !wrongCurrentPassword) {
				console.log('updating user id: ', postParams.id);
				Account.update({id: postParams.id}, {$set:{'resetToken':'', 'password':postParams.newPass}}, (err,result) => {
					if (err) throw err;
					reportRenewedTokenToUser(req,res);
					console.log('change self password for user id '+postParams.id+' :',result);
					res.json({success: 'User with id '+postParams.id+' changed self password'});
				});
			} else {
				let message = [];
				if (!isOwner) message.push('Permission denied');
				if (wrongCurrentPassword) message.push('Wrong current password');
				if (postParamsMissing) message.push('Missing mandatory request params');
				if (notFound) message.push('User with id '+postParams.id+' was not found');
				res.status(401).json({error: message});
			}
		});
	});

	app.get('/api/users/list', (req, res) => {
		console.log('users list');
		/*
		* requires auth (user or admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			if (docs.length == 0) {
				console.log('users do not exist, initializing data');
				DataInit.initData(() => {
					const query = '?user_token='+req.query.user_token;
					res.redirect('/api/users/list'+query);
				});
			} else {
				console.log('users exist');
				/*
				* all sensitive data must be removed from the respose
				*/
				let data = [];
				for (let doc of docs) {
					if (doc.role != 'admin') {
						data.push({
							id: doc.id,
							login: doc.login,
							email: doc.email,
							fullName: doc.firstName+' '+doc.lastName,
							firstName: doc.firstName,
							lastName: doc.lastName,
							role: doc.role,
							lastLogin: (doc.lastLogin) ? doc.lastLogin : null
						});
					}
				}
				reportRenewedTokenToUser(req,res);
				res.json(data);
			}
		});
	});

	app.post('/api/users/new', (req, res) => {
		console.log('new user');
		/*
		* requires auth (admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isAdmin = false,
				alreadyExists = false,
				postParamsMissing = false,
				nextUserId = 0;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token) {
					if (doc.role == 'admin') isAdmin = true;
				}
				if (doc.email == postParams.email) alreadyExists = true;
				if (doc.id >= nextUserId) nextUserId = doc.id+1;
			}
			console.log('post params:', postParams);
			if (typeof postParams.email == 'undefined'
				//|| typeof postParams.password == 'undefined'
				|| typeof postParams.firstName == 'undefined'
				|| typeof postParams.lastName == 'undefined'
				|| typeof postParams.role == 'undefined'
				) postParamsMissing = true;
			console.log('isAdmin:', isAdmin);
			console.log('alreadyExists:', alreadyExists);
			console.log('postParamsMissing:', postParamsMissing);
			if (isAdmin && !alreadyExists && !postParamsMissing) {
				console.log('next user id:', nextUserId);
				let newAccount = new Account();
				newAccount.id = nextUserId;
				newAccount.login = postParams.email.substring(0,postParams.email.indexOf('@'));
				newAccount.email = postParams.email;
				newAccount.password = crypto.randomBytes(4).toString('hex');
				newAccount.resetToken = '';
				newAccount.jwToken = '';
				newAccount.salt = '';
				newAccount.firstName = postParams.firstName;
				newAccount.lastName = postParams.lastName;
				newAccount.role = postParams.role;
				newAccount.save((err, createdUser) => {
					if (err) throw err;
					console.log('new user created:', createdUser);
					reportRenewedTokenToUser(req,res);
					res.json({success: 'User with email '+createdUser.email+' was created'});
					sendEmailGreeting(createdUser.email, createdUser.password);
				});
			} else {
				let message = [];
				if (!isAdmin) message.push('Permission denied');
				if (alreadyExists) message.push('Account with this email already exists');
				if (postParamsMissing) message.push('Missing mandatory request params');
				res.status(401).json({error: message});
			}
		});
	});

	app.post('/api/users/update', (req, res) => {
		console.log('update user');
		/*
		* requires auth (admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isAdmin = false,
				notFound = true,
				postParamsMissing = false,
				currentValues = null;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token) {
					if (doc.role == 'admin') isAdmin = true;
				}
				if (doc.id == postParams.id) {
					notFound = false;
					currentValues = doc;
				}
			}
			console.log('current values:', currentValues);
			console.log('post params:', postParams);
			if (typeof postParams.id == 'undefined') postParamsMissing = true;
			console.log('isAdmin:', isAdmin);
			console.log('postParamsMissing:', postParamsMissing);
			if (isAdmin && !postParamsMissing && !notFound) {
				console.log('updating user id:', postParams.id);
				Account.update({id: postParams.id}, {$set: {
					login: (postParams.email) ? postParams.email.substring(0,postParams.email.indexOf('@')) : currentValues.login,
					email: (postParams.email) ? postParams.email : currentValues.email,
					firstName: (postParams.firstName) ? postParams.firstName : currentValues.firstName,
					lastName: (postParams.lastName) ? postParams.lastName : currentValues.lastName,
					role: (postParams.role) ? postParams.role : currentValues.role
				}}, (err, result) => {
					if (err) throw err;
					reportRenewedTokenToUser(req,res);
					console.log('update user by id', postParams.id, ':', result);
					res.json({success: 'User with id '+postParams.id+' was updated'});
				});
			} else {
				let message = [];
				if (!isAdmin) message.push('Permission denied');
				if (postParamsMissing) message.push('Missing mandatory request params');
				if (notFound) message.push('User with id '+postParams.id+' was not found');
				res.status(401).json({error: message});
			}
		});
	});

	app.post('/api/users/remove', (req, res) => {
		console.log('remove user');
		/*
		* requires auth (admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isAdmin = false,
				notFound = true,
				postParamsMissing = false;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token) {
					if (doc.role == 'admin') isAdmin = true;
				}
				if (doc.id == postParams.id) notFound = false;
			}
			console.log('post params', postParams);
			if (typeof postParams.id == 'undefined') postParamsMissing = true;
			console.log('isAdmin:', isAdmin);
			console.log('postParamsMissing:', postParamsMissing);
			if (isAdmin && !postParamsMissing && !notFound) {
				console.log('deleting user id:', postParams.id);
				Account.remove({id: postParams.id}, (err, result) => {
					if (err) throw err;
					reportRenewedTokenToUser(req,res);
					console.log('remove user by id', postParams.id, ':', result);
					res.json({success: 'User with id '+postParams.id+' was removed'});
				});
			} else {
				let message = [];
				if (!isAdmin) message.push('Permission denied');
				if (postParamsMissing) message.push('Missing mandatory request params');
				if (notFound) message.push('User with id '+postParams.id+' was not found');
				res.status(401).json({error: message});
			}
		});
	});

	app.post('/api/users/resetpass', (req, res) => {
		console.log('initiate reset user password procedure');
		let passResetBaseUrl = req.protocol+'://'+req.headers.host;
		console.log('passResetBaseUrl:', passResetBaseUrl);
		/*
		* requires auth (admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isAdmin = false,
				notFound = true,
				postParamsMissing = false,
				selectedUserObj;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token) {
					if (doc.role == 'admin') isAdmin = true;
				}
				if (doc.id == postParams.id) {
					notFound = false;
					selectedUserObj = doc;
				}
			}
			console.log('post params', postParams);
			if (typeof postParams.id == 'undefined') postParamsMissing = true;
			console.log('isAdmin:', isAdmin);
			console.log('postParamsMissing:', postParamsMissing);
			if (isAdmin && !postParamsMissing && !notFound) {
				console.log('generating password reset token for user id:', postParams.id);
				let passResetTokenObj = generateDerivate(selectedUserObj.password, selectedUserObj.salt);
				console.log(passResetTokenObj);
				updateUserPassResetToken(postParams.id, passResetTokenObj, () => {
					sendEmailPasswordReset(selectedUserObj.email, passResetBaseUrl+'/getpass?reset_token='+passResetTokenObj.derivate);
					res.json({
						success: 'Password reset token was generated for user id '+postParams.id+', password reset link was sent to the user\'s email',
						reset_token: passResetTokenObj.derivate
					});
				});
			} else {
				let message = [];
				if (!isAdmin) message.push('Permission denied');
				if (postParamsMissing) message.push('Missing mandatory request params');
				if (notFound) message.push('User with id '+postParams.id+' was not found');
				res.status(401).json({error: message});
			}
		});
	});

// Entrants

	app.post('/entrants/new', (req, res) => {
		console.log('new entrant');
		/*
		* does not require auth
		*/
		let postParams = req.body,
			postParamsMissing = false,
			nextEntrantId = 0;
		console.log('post params:', postParams);
		if (typeof postParams.firstName == 'undefined'
			|| typeof postParams.lastName == 'undefined'
			|| typeof postParams.phone == 'undefined'
			|| typeof postParams.email == 'undefined'
			|| typeof postParams.email == 'undefined'
			|| typeof postParams.participates == 'undefined'
			|| typeof postParams.amount == 'undefined'
			|| typeof postParams.vendorId == 'undefined'
			|| typeof postParams.message == 'undefined'
			|| typeof postParams.image == 'undefined') postParamsMissing = true;
		console.log('postParamsMissing:', postParamsMissing);
		if (!postParamsMissing) {
			Entrant.find({}, (err, docs) => {
				for (let doc of docs) {
					if (doc.id >= nextEntrantId) nextEntrantId = doc.id+1;
				}
				console.log('next entrant id:', nextEntrantId);
				let newEntrant = new Entrant();
				newEntrant.id = nextEntrantId;
				newEntrant.firstName = postParams.firstName;
				newEntrant.lastName = postParams.lastName;
				newEntrant.phone = postParams.phone;
				newEntrant.email = postParams.email;
				newEntrant.participates = postParams.participates;
				newEntrant.created = new Date().getTime();
				newEntrant.control = {
					amount: postParams.amount,
					vendorId: postParams.vendorId,
					message: postParams.message,
					image: postParams.image
				};
				newEntrant.save((err, createdEntrant) => {
					if (err) throw err;
					console.log('new entrant created:', createdEntrant);
					res.json({success: 'New entrant '+postParams.firstName+' '+postParams.lastName+' was created'});
				});
			});
		} else {
			res.status(401).json({error: 'Missing mandatory request params'});
		}
	});

	app.get('/api/entrants/list', (req, res) => {
		console.log('entrants list');
		let limit = null,
			offset = null;
		if (req.query.limit) limit = parseInt(req.query.limit, 10);
		if (req.query.offset) offset = parseInt(req.query.offset, 10);
		/*
		* requires auth (user or admin)
		*/
		Entrant.count({}, (err, count) => {
			Entrant.find({}, {}, {limit: limit, skip: offset}, (err, docs) => {
				if (err) throw err;
				if (docs.length == 0) {
					console.log('entrants do not exist, initializing data');
					DataInit.initData(() => {
						const query = '?limit='+limit+'&offset='+offset+'&user_token='+req.query.user_token;
						res.redirect('/api/entrants/list'+query);
					});
				} else {
					console.log('entrants exist');
					reportRenewedTokenToUser(req,res);
					res.json({
						data: docs,
						limit: (limit) ? limit : 0,
						offset: offset,
						pages: (limit && limit > 0) ? Math.ceil(count/limit) : 1,
						elements: count
					});
				}
			});
		});
	});

	app.post('/api/entrants/switch', (req, res) => {
		console.log('switch entrant\'s participation');
		/*
		* requires auth (admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isAdmin = false,
				postParamsMissing = false;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token) {
					if (doc.role == 'admin') isAdmin = true;
				}
			}
			console.log('post params:', postParams);
			if (typeof postParams.id == 'undefined') postParamsMissing = true;
			console.log('isAdmin:', isAdmin);
			console.log('postParamsMissing:', postParamsMissing);
			if (isAdmin && !postParamsMissing) {
				Entrant.find({id: postParams.id}, (err, docs) => {
					if (docs.length > 0) {
						console.log('updating entrant id', postParams.id, 'participation');
						const currentValues = docs[0];
						console.log('current values:', currentValues);
						Entrant.update({id: postParams.id}, {$set: {
							participates: (currentValues.participates) ? false : true
						}}, (err, result) => {
							if (err) throw err;
							reportRenewedTokenToUser(req,res);
							console.log('update entrant id', postParams.id, 'participation:', result);
							res.json({success: 'Entrant id '+postParams.id+' participation was switched'});
						});
					} else res.status(401).json({error: ['Entrant with id '+postParams.id+' was not found']});
				});
			} else {
				let message = [];
				if (!isAdmin) message.push('Permission denied');
				if (postParamsMissing) message.push('Missing mandatory request params');
				res.status(401).json({error: message});
			}
		});
	});

	app.post('/api/entrants/remove', (req, res) => {
		console.log('remove entrant');
		/*
		* requires auth (admin)
		*/
		Account.find({}, (err, docs) => {
			if (err) throw err;
			let postParams = req.body,
				isAdmin = false,
				postParamsMissing = false;
			for (let doc of docs) {
				if (doc.jwToken == postParams.user_token) {
					if (doc.role == 'admin') isAdmin = true;
				}
			}
			console.log('post params:', postParams);
			if (typeof postParams.id == 'undefined') postParamsMissing = true;
			console.log('isAdmin:', isAdmin);
			console.log('postParamsMissing:', postParamsMissing);
			if (isAdmin && !postParamsMissing) {
				Entrant.find({id: postParams.id}, (err, docs) => {
					if (docs.length > 0) {
						console.log('removing entrant id:', postParams.id);
						Entrant.remove({id: postParams.id}, (err, result) => {
							if (err) throw err;
							reportRenewedTokenToUser(req,res);
							console.log('remove entrant by id', postParams.id, ':',result);
							res.json({success: 'Entrant with id '+postParams.id+' was removed'});
						});
					} else res.status(401).json({error: ['Entrant with id '+postParams.id+' was not found']});
				});
			} else {
				let message = [];
				if (!isAdmin) message.push('Permission denied');
				if (postParamsMissing) message.push('Missing mandatory request params');
				res.status(401).json({error: message});
			}
		});
	});

// Analytics

	app.get('/api/analytics/data', (req, res) => {
		console.log('analytic data');
		let data = {};
		/*
		* requires auth (user or admin)
		*/
		Entrant.find({}, (err, docs) => {
			if (err) throw err;
			data.entrants = [];
			docs.forEach((item) => {
				data.entrants.push({ id: item.id, created: item.created, participates: item.participates, vendorId: item.control.vendorId});
			});
			reportRenewedTokenToUser(req,res);
			res.json(data);
		});
	});

	app.post('/api/analytics/getreport', (req, res) => {
		console.log('get report');
		let requesterEmail = (req.body.email) ? req.body.email : null;
		console.log('requesterEmail: ', requesterEmail);
		/*
		* requires auth (user or admin)
		*/
		if (requesterEmail) {
			reporterSingleRun.generateReport((plainTextReport, htmlReport, reportFilePath) => {
				/*
				*	development config - process.env.MAILER_EMAIL
				*	production config - requesterEmail
				*/
				sendEmailReport(process.env.MAILER_EMAIL, plainTextReport, htmlReport, reportFilePath, (result) => {
				//sendEmailReport(requesterEmail, plainTextReport, htmlReport, reportFilePath, (result) => {
					result.plainTextReport = (plainTextReport) ? true : false;
					result.htmlReport = (htmlReport) ? true : false;
					result.downloadableReport = (reportFilePath) ? true : false;
					if (result.success) res.json(result);
					if (result.error) res.status(500).json(result);
				});
			});
		} else {
			res.status(400).json({error: 'Missing mandatory request parameters'});
		}
	});

	/*
	*	application diagnostics
	*/
	app.get('/app-diag/static', (req, res) => {
		res.setHeader('Cache-Control', 'no-cache, no-store');
		res.format({
			'application/json': function(){
				res.send(SrvInfo['static']());
			}
		});
	});

	app.ws('/app-diag/dynamic', (ws) => {
		console.log('websocket opened /app-diag/dynamic');
		let sender = null;
		ws.on('message', (msg) => {
			console.log('message:',msg);
			function sendData () {
				ws.send(JSON.stringify(SrvInfo['dynamic']()), (err) => {if (err) throw err;});
			}
			if (JSON.parse(msg).action === 'get') {
				console.log('ws open, data sending started');
				sendData();
				sender = setInterval(() => {
					sendData();
				}, 5000);
			}
			if (JSON.parse(msg).action === 'pause') {
				console.log('ws open, data sending paused');
				clearInterval(sender);
			}
		});
		ws.on('close', () => {
			console.log('Persistent websocket: Client disconnected.');
			if (ws._socket) {
				ws._socket.setKeepAlive(true);
			}
			clearInterval(sender);
		});
		ws.on('error', () => {console.log('Persistent websocket: ERROR');});
	});

};
