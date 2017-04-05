'use strict';

var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-api-token-bearer').Strategy;
var Account = require('../models/accounts');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		Account.findOne({ 'id': id }, function (err, user) {
			done(err, user);
		});
	});
	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},function (req, username, password, done) {
		process.nextTick(function () {
			Account.findOne({ 'email': username }, function (err, user) {
				if (err) return done(err);
				if (!user) return done(null, false, { message: 'Unknown user' });
				if (user.password != password) return done(null, false, { message: 'Wrong password' });
				return done(null, user);
			});
		});
	}));
	passport.use(new BearerStrategy({
		access_token: 'user_token'
	},function (token, done) {
		process.nextTick(function () {
			Account.findOne({ 'jwToken': token }, function (err, user) {
				if (err) return done(err);
				if (!user) return done(null, false, { statusCode: 401, error: true, message: 'Unknown user' });
				//if (!token) return done(null, false, { statusCode: 401, error: true, message: 'Missing token' });
				return done(null, user, { statusCode: 200, scope: 'all' });
			});
		});
	}));
};
