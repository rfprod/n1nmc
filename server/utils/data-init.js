const Account = require('../models/accounts'),
	Entrant = require('../models/entrants');

module.exports = {

	createDefaultAdmin: function(callback) {
		Account.find({id: 0}, (err, docs) => {
			if (err) throw err;
			if (docs.length === 0) {
				let newAccount = new Account();
				newAccount.id = 0;
				newAccount.login = 'admin';
				newAccount.email = 'admin@admin.admin';
				newAccount.password = '000';
				newAccount.resetToken = '';
				newAccount.jwToken = '';
				newAccount.salt = '';
				newAccount.firstName = 'First';
				newAccount.lastName = 'Last';
				newAccount.role = 'admin';
				newAccount.lastLogin = null;
				newAccount.save((err) => {
					if (err) throw err;
					console.log('default admin created');
					callback(newAccount);
				});
			} else {
				console.log('default admin exists');
				callback(docs[0]);
			}
		});
	},

	createDefaultUser: function(callback) {
		/*
		*	two users in fact, needed for tests
		*/
		let response = [];
		for (let i = 1; i <= 2; i++) {
			Account.find({id: i}, (err, docs) => {
				if (err) throw err;
				if (docs.length === 0) {
					let newAccount = new Account();
					newAccount.id = i;
					newAccount.login = 'user' + i;
					newAccount.email = 'user' + i + '@email.email';
					newAccount.password = '000';
					newAccount.resetToken = '';
					newAccount.jwToken = '';
					newAccount.salt = '';
					newAccount.firstName = 'first name ' + i;
					newAccount.lastName = 'last name ' + i;
					newAccount.role = 'user';
					newAccount.lastLogin = null;
					newAccount.save((err) => {
						if (err) throw err;
						console.log('default user created');
						response.push(newAccount);
					});
				} else {
					console.log('default user exists');
					response.push(docs[0]);
				}
				if (i === 2) { callback(response); }
			});
		}
	},

	createDefaultEntrant: function(callback) {
		Entrant.find({id: 0}, (err, docs) => {
			if (err) throw err;
			if (docs.length === 0) {
				let newEntrant = new Entrant();
				newEntrant.id = 0;
				newEntrant.firstName = 'entrantFirst';
				newEntrant.lastName = 'entrantLast';
				newEntrant.phone = '+71234567890';
				newEntrant.email = 'entrant@email.tld';
				newEntrant.participates = true;
				newEntrant.created = new Date().getTime();
				newEntrant.control = {
					amount: 10,
					vendorId: 'asf8879',
					message: 'This is an offering from the user',
					image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAFUklEQVR4nO3cbW7bOhSEYe9/bdyGsozM/ZG611H1QYo85Aw5L2CgTWKLOucBEqRJXyklbNvmhx/NHiklvLZt+04pwbkWpZTw9fX1/dq27fv9Budqehv6BevzHc6V9mnnH1j7D3Aup72ZQ1hHH+jcWUdWTmGdPcG5z86MXMK6eqJzVzZuYd29gFuzOxNZsHJeyK1TjoVsWLkv6OYu10ARrJIXdvNVsvtiWKUXcHNUuvNHsJ5cyOn2ZNePYT29oNPq6Y6rYNVc2PFXs9tqWLUHcJzV7rQJrBYHcTy12GUzWIBxzVCrHTaFBRiXci131xwWYFyKtd5ZCCzAuJSK2FUYLMC4FIraUSgswLiYi9xNOCzAuBiL3kkXWIBxMdVjF91gAcbFUK8ddIUFGNfIes6+OyzAuEbUe+ZDYAHG1bMRsx4GCzCuHo2a8VBYgHFFNnK2w2EBxhXR6JlSwALGD2KmGGZJAwvgGIh6LDOkggXwDEYxptnRwQK4BqQS28woYQF8g2KOcVa0sADOgbHFOiNqWADv4Bhing09LIB7gKNin4kELIB/kD1TmIUMLEBjoNGpzEAKFqAz2IiU7l0OFqA14Fap3bMkLEBv0DUp3qssLEBz4KWp3qM0LEB38Dkp35s8LEB7AWep39MUsAD9RXw2w71MAwuYYyEz3AMwGSxAezHKZ983HSxAc0GKZ75qSliA1qKUzprbtLAAjYUpnPFJU8MCuBfHfLbapocFcC6Q8UwtWwIWwLVIprNEtQwsgGOhDGfo0VKwgLGLXQUVsCAsYMyCV0IFLAoL6Lvo1VABC8MC+ix8RVTA4rCA2MWvigowLAAxAFZGBRjW31pCWB0VYFi/agHCqH4yrF01MIzq/wzroCdAjOp3hnVSCRSj+jfDuigHjFEdZ1g3XcExqvMMK6MjQEZ1nWFl9gnJqO4zrIJSSkaVmWEVZFj5GVZm/lRYlmFl5C/eyzOsm/zthmcZ1kX+BunzDOsk/5NOXYZ1kP8Ruj7D2uUfm2mTYX3kH/Rrl2H9yT+a3DbDgn+ZIqLlYfnXv2JaGpZ/YTWuZWH5V+xjWxKW/1OQ+JaD5f/GqE9LwWJYLMMZerQMLKaFMp0lqiVgMS6S8Uwtmx4W8wKZz1bb1LAUFqdwxidNC0tpYUpnzW1KWIqLUjzzVdPBUl6Q8tn3TQVrhsXMcA/ARLBmWQgwx71MAWuGRexTvyd5WOoLuEr53qRhKQ8+N9V7lIWlOvAnKd6rJCzFQdemds9ysNQG3DKle5eCpTTYqFRmIANLZaA9UpiFBCyFQfaOfSb0sNgHODLm2VDDYh4cS6wzooXFOjDGGGdFCYtxUOyxzYwOFtuAlGKaHRUspsGoxjJDGlgsA5khhllSwGIYxGyNnulwWKMHMHMjZzsUllHFN2rGw2AZVb9GzHoILKPqX++Zd4dlVOPqOfuusIxqfL120A2WUfHUYxddYBkVX9E7CYdlVLxF7iYUllHxF7WjMFhGpVPErkJgGZVerXfWHJZR6dZyd01hGZV+rXbYDJZRzVOLXTaBZVTzVbvTalhGNW81u62CZVTz93THj2EZ1To92fUjWEa1XqU7L4ZlVOtWsvsiWEblcg1kwzKquF6v1+nb94+r9/e6/tvC1fWzYBlVTHcorrAcva8UV+T1b2EZVXwRi92DeQLo7vp7G9mwjKpPuZ+K7p5z9TGlSHOv/2kkC5ZR9Sv3U9gdlLO33b1+7fU/v+Z6dwjLqPqmDgv4MXMJy6j6V4Kk5Dk1nwprr/8LllH1rfbbCTnPPft71PXfhv7CMirXqpTSD6w/f/DDj2aPlBL+A96ddAreKL7XAAAAAElFTkSuQmCC'
				};
				newEntrant.save((err) => {
					if (err) throw err;
					console.log('default entrant created');
					callback(newEntrant);
				});
			} else {
				console.log('default entrant exists');
				callback(docs[0]);
			}
		});
	},

	initData: function(callback) {
		console.log('db data initialization');
		let response = {};
		this.createDefaultAdmin((account) => {
			response.defaultAdmin = account;
			this.createDefaultUser((account) => {
				response.defaultUser = account;
				this.createDefaultEntrant((entrant) => {
					response.defaultEntrant = entrant;
					console.log('data initialized:', response);
					if (callback) callback();
				});
			});
		});
	}

};
