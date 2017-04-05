'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Entrant = new Schema({
	id: 					Number,
	firstName: 		String,
	lastName: 		String,
	phone: 				String,
	email: 				String,
	participates: Boolean,
	created: 			Number,
	control: {
		amount: 		Number,	// amount of money spent
		vendorId: 	String,	// vendor identifier
		message: 		String,	// message
		image: 			String	// control image scan or photo base64
	}
});

module.exports = mongoose.model('Entrant', Entrant);
