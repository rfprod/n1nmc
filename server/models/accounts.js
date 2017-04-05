'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
	id: 				Number,
	login: 			String,
	email: 			String,
	password: 	String,
	resetToken: String,
	jwToken: 		String,
	salt: 			String, 
	firstName:	String,
	lastName: 	String,
	role: 			String,
	lastLogin: 	Number
});

module.exports = mongoose.model('Account', Account);
