var assert = require('chai').assert,
	expect = require('chai').expect;

var webSocket = require('ws');

var request = require('request');
var cheerio = require('cheerio'),
	str = require('string');

require('dotenv').load();
var baseUrl = 'http://localhost:'+process.env.PORT;

function genRandomName() {
	var randomText = "";
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 5; i++ ) randomText += chars.charAt(Math.floor(Math.random() * chars.length));
	return randomText;
}
var randomName;

var cookieJarFailedLogin = request.jar();
var token = '';
var nonExistentId = 500000;

describe('/login endpoint', function() {
	it('should return a token if user tries to log in with default admin credentials', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			expect(JSON.parse(response.body).token).to.be.not.a('undefined');
			assert.isString(JSON.parse(response.body).token);
			token = JSON.parse(response.body).token;

			done();
		});
	});

	it('should return redirect to /loginerror endpoint if wrong request body params are passed', function(done) {
		request.post({url: baseUrl+'/login', form: {emal: 'admin@admin.admin', passwrd: '000'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(302);
			assert.match(response.body, /\/loginerror/);

			done();
		});
	});

	it('should return respective flashed message after redirect to /loginerror endpoint if wrong request body params are passed', function(done) {
		request.post({url: baseUrl+'/login', form: {emal: 'admin@admin.admin', passwrd: '000'}, followAllRedirects: true, jar: cookieJarFailedLogin}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing credentials',responseObj.error);

			done();
		});
	});

	it('should return redirect to /loginerror endpoint if wrong password is provided', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '001'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(302);
			assert.match(response.body, /\/loginerror/);

			done();
		});
	});

	it('should return respective flashed message after redirect to /loginerror endpoint if wrong password is provided', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '001'}, followAllRedirects: true, jar: cookieJarFailedLogin}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Wrong password',responseObj.error);

			done();
		});
	});

	it('should return redirect to /loginerror endpoint if wrong email is provided', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin1', password: '000'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(302);
			assert.match(response.body, /\/loginerror/);

			done();
		});
	});

	it('should return respective flashed message after redirect to /loginerror endpoint if wrong email is provided', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin1', password: '000'}, followAllRedirects: true, jar: cookieJarFailedLogin}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

});

describe('/loginerror endpoint', function() {
	it('should return error if user tries to log out without being logged in', function(done) {
		request(baseUrl+'/logout', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Not logged in',responseObj.error);

			done();
		});
	});
});

describe('/logout endpoint', function() {
	it('should return error if user tries to log out without being logged in', function(done) {
		request(baseUrl+'/logout', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Not logged in',responseObj.error);

			done();
		});
	});

	it('should return a \'Logged out\' message if user logs out after logging in', function(done) {
		request.get({url: baseUrl+'/logout?user_token='+token}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('Logged out',responseObj.success);

			done();
		});
	});
});

describe('/api/users/me endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request(baseUrl+'/api/users/me?user_token=', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request(baseUrl+'/api/users/me?user_token=aa', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return authenticated user details db if user is logged in, at least one user must exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.get({url: baseUrl+'/api/users/me?user_token='+token}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(200);
				assert.notEqual(0,JSON.parse(response.body).length);

				done();
			});
		});
	});

	it('user object must have defined properties', function(done) {
		request.get({url: baseUrl+'/api/users/me?user_token='+token}, function(error,response,body) {

			var responseObj = JSON.parse(response.body);
			expect(responseObj[0].id).to.be.not.a('undefined');
			expect(responseObj[0].login).to.be.not.a('undefined');
			expect(responseObj[0].email).to.be.not.a('undefined');
			expect(responseObj[0].firstName).to.be.not.a('undefined');
			expect(responseObj[0].lastName).to.be.not.a('undefined');
			expect(responseObj[0].role).to.be.not.a('undefined');
			expect(responseObj[0].lastLogin).to.be.not.a('undefined');

			done();
		});
	});

});

describe('/api/users/me/update endpoint', function() {

	var currentUserId = undefined;
	beforeEach(function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			var decoded = new Buffer(token.split('.')[1], 'base64').toString();
			currentUserId = JSON.parse(decoded).id;
			done();
		});
	});

	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/users/me/update', form: {id: currentUserId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/me/update', form: {id: currentUserId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user tries to edit another', function(done) {
		request.post({url: baseUrl+'/api/users/me/update', form: {id: currentUserId - 1, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Permission denied',responseObj.error[0]);

			done();
		});
	});

	it('should return error if user with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/me/update', form: {id: nonExistentId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Permission denied',responseObj.error[0]);
			assert.equal('User with id '+nonExistentId+' was not found',responseObj.error[1]);

			done();
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/users/me/update', form: {ido: currentUserId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Permission denied',responseObj.error[0]);
			assert.equal('Missing mandatory request params',responseObj.error[1]);

			done();
		});
	});

	it('should return success if user is editing self, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/users/me/update', form: {id: currentUserId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('User with id '+currentUserId+' updated self',responseObj.success);

			done();
		});
	});

});

describe('/api/users/me/changepass endpoint', function() {

	var currentUserId = undefined;
	beforeEach(function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			var decoded = new Buffer(token.split('.')[1], 'base64').toString();
			currentUserId = JSON.parse(decoded).id;
			done();
		});
	});

	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/users/me/changepass', form: {id: currentUserId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/me/changepass', form: {id: currentUserId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user tries to edit another', function(done) {
		request.post({url: baseUrl+'/api/users/me/changepass', form: {id: currentUserId - 1, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Permission denied',responseObj.error[0]);

			done();
		});
	});

	it('should return error if user with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/me/changepass', form: {id: nonExistentId, currentPass: '000', newPass: '000', user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Permission denied',responseObj.error[0]);
			assert.equal('Wrong current password',responseObj.error[1]);
			assert.equal('User with id '+nonExistentId+' was not found',responseObj.error[2]);

			done();
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/users/me/changepass', form: {id: currentUserId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Wrong current password',responseObj.error[0]);
			assert.equal('Missing mandatory request params',responseObj.error[1]);

			done();
		});
	});

	it('should return success if user is editing self, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/users/me/changepass', form: {id: currentUserId, currentPass: '000', newPass: '000', user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('User with id '+currentUserId+' changed self password',responseObj.success);

			done();
		});
	});

});

var existentAccountId = 2;
describe('/api/users/list endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request(baseUrl+'/api/users/list?user_token=', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request(baseUrl+'/api/users/list?user_token=aa', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return all existing users from db if user is logged in, at least one user must exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.get({url: baseUrl+'/api/users/list?user_token='+token}, function(error,response,body) {

				var responseData = JSON.parse(response.body);
				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(200);
				assert.notEqual(0,responseData.length);

				done();
			});
		});
	});

	it('user object must have defined properties', function(done) {
		request.get({url: baseUrl+'/api/users/list?user_token='+token}, function(error,response,body) {

			var responseObj = JSON.parse(response.body);
			expect(responseObj[0].id).to.be.not.a('undefined');
			expect(responseObj[0].login).to.be.not.a('undefined');
			expect(responseObj[0].email).to.be.not.a('undefined');
			expect(responseObj[0].fullName).to.be.not.a('undefined');
			expect(responseObj[0].firstName).to.be.not.a('undefined');
			expect(responseObj[0].lastName).to.be.not.a('undefined');
			expect(responseObj[0].role).to.be.not.a('undefined');
			expect(responseObj[0].lastLogin).to.be.not.a('undefined');

			existentAccountId = responseObj.reduce((a, b) => (!a) ? b.id : (a < b.id) ? b.id : a, 0);

			done();
		});
	});

});

describe('/api/users/new endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/users/new', form: {email: 'user2@email.email',password: '000', firstName: 'first', lastName: 'last', department: 0, role: 'user', user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/new', form: {email: 'user2@email.email',password: '000', firstName: 'first', lastName: 'last', department: 0, role: 'user', user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user is not admin', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/new', form: {email: 'user2@email.email',password: '000', firstName: 'first', lastName: 'last', department: 0, role: 'user', user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Permission denied',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if user with this email already exists', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/new', form: {email: 'user1@email.email',password: '000', firstName: 'first', lastName: 'last', department: 0, role: 'user', user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Account with this email already exists',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/users/new', form: {emailo: 'user2@email.email',password: '000', firstName: 'first', lastName: 'last', department: 0, role: 'user', user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error[0]);

			done();
		});
	});

	it('should return success if user is admin, token exists, email is unique, all request params are present', function(done) {
		randomName = genRandomName();

		request.post({url: baseUrl+'/api/users/new', form: {email: randomName+'@email.email',password: '000', firstName: 'first', lastName: 'last', department: 0, role: 'user', user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('User with email '+randomName+'@email.email was created',responseObj.success);

			done();
		});
	});

});

describe('/api/users/update endpoint', function() {

	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/users/update', form: {id: existentAccountId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/update', form: {id: existentAccountId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user is not admin', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/update', form: {id: existentAccountId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Permission denied',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if user with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/update', form: {id: nonExistentId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('User with id '+nonExistentId+' was not found',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/users/update', form: {ido: existentAccountId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error[0]);

			done();
		});
	});

	it('should return success if user is admin, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/users/update', form: {id: existentAccountId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('User with id '+existentAccountId+' was updated',responseObj.success);

			done();
		});

	});

});

var passResetToken = '';
describe('/api/users/resetpass endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/users/resetpass', form: {id: existentAccountId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/resetpass', form: {id: existentAccountId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user is not admin', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/resetpass', form: {id: existentAccountId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Permission denied',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if user with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/resetpass', form: {id: nonExistentId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('User with id '+nonExistentId+' was not found',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/users/resetpass', form: {ido: existentAccountId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error[0]);

			done();
		});
	});

	it('should return success if user is admin, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/users/resetpass', form: {id: existentAccountId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			expect(responseObj.reset_token).to.be.not.a('undefined');
			assert.equal('Password reset token was generated for user id '+existentAccountId+', password reset link was sent to the user\'s email',responseObj.success);

			passResetToken = responseObj.reset_token;

			done();
		});
	});

});

describe('/getpass endpoint', function() {
	it('should return error if password reset token is missing', function(done) {
		request(baseUrl+'/getpass', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'reset_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if password reset token does not exist', function(done) {
		request(baseUrl+'/getpass?reset_token=aa', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Invalid token',responseObj.error);

			done();
		});
	});

	it('should return success if password reset token exists', function(done) {
		request(baseUrl+'/getpass?reset_token='+passResetToken, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseHTML = response.body;
			expect(responseHTML).to.be.not.a('undefined');
			assert.include(responseHTML, 'Новый пароль от вашей учётной записи был отправлен на ваш адрес электронной почты');

			done();
		});
	});

});

//existentAccountId++;
describe('/api/users/remove endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/users/remove', form: {id: existentAccountId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/users/remove', form: {id: existentAccountId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user is not admin', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/remove', form: {id: existentAccountId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Permission denied',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if user with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/users/remove', form: {id: nonExistentId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('User with id '+nonExistentId+' was not found',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/users/remove', form: {ido: existentAccountId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error[0]);

			done();
		});
	});

	it('should return success if user is admin, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/users/remove', form: {id: existentAccountId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('User with id '+existentAccountId+' was removed',responseObj.success);

			existentAccountId--;

			done();
		});
	});

});

var existentEntrantId = 0;
describe('/api/entrants/list endpoint', function() {

	it('should return error if user token is missing', function(done) {
		request(baseUrl+'/api/entrants/list?user_token=', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user is not logged in', function(done) {
		request(baseUrl+'/logout?user_token='+token, function(error,response,body) {
			request(baseUrl+'/api/entrants/list?user_token='+token, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Unknown user',responseObj.error);

				done();
			});
		});
	});

	it('should return all existing entrants from db if user is logged in, at least one entrant (test one) must exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.get({url: baseUrl+'/api/entrants/list?user_token='+token}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(200);
				assert.notEqual(0,JSON.parse(response.body).length);

				done();
			});
		});
	});

	it('entrants object must have defined properties', function(done) {
		request.get({url: baseUrl+'/api/entrants/list?user_token='+token}, function(error,response,body) {

			var responseObj = JSON.parse(response.body).data;
			expect(responseObj[0].id).to.be.not.a('undefined');
			expect(responseObj[0].firstName).to.be.not.a('undefined');
			expect(responseObj[0].lastName).to.be.not.a('undefined');
			expect(responseObj[0].phone).to.be.not.a('undefined');
			expect(responseObj[0].email).to.be.not.a('undefined');
			expect(responseObj[0].participates).to.be.not.a('undefined');
			expect(responseObj[0].created).to.be.not.a('undefined');
			expect(responseObj[0].control).to.be.not.a('undefined');
			expect(responseObj[0].control.amount).to.be.not.a('undefined');
			expect(responseObj[0].control.vendorId).to.be.not.a('undefined');
			expect(responseObj[0].control.message).to.be.not.a('undefined');
			expect(responseObj[0].control.image).to.be.not.a('undefined');

			existentEntrantId = responseObj[responseObj.length-1].id;

			done();
		});
	});
});

var randomFirst, randomLast;
describe('/entrants/new endpoint', function() {
	it('should return error if mandatory post params are missing', function(done) {
		randomFirst = genRandomName();
		randomLast = genRandomName();
		request.post({url: baseUrl+'/entrants/new', form: {
				first: randomFirst,
				lastName: randomLast,
				phone: '+71234567891',
				email: 'entrant@email.tld',
				participates: true,
				created: new Date().getTime(),
				amount: 10,
				vendorId: 'id',
				message: 'msg',
				image: 'data:image/png;base64,iVBORw'
			}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error);

			done();
		});
	});

	it('should return success if all request params are present', function(done) {
		randomFirst = genRandomName();
		randomLast = genRandomName();
		request.post({url: baseUrl+'/entrants/new', form: {
				firstName: randomFirst,
				lastName: randomLast,
				phone: '+71234567891',
				email: 'entrant@email.tld',
				participates: true,
				created: new Date().getTime(),
				amount: 10,
				vendorId: 'id',
				message: 'msg',
				image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAFUklEQVR4nO3cbW7bOhSEYe9/bdyGsozM/ZG611H1QYo85Aw5L2CgTWKLOucBEqRJXyklbNvmhx/NHiklvLZt+04pwbkWpZTw9fX1/dq27fv9Budqehv6BevzHc6V9mnnH1j7D3Aup72ZQ1hHH+jcWUdWTmGdPcG5z86MXMK6eqJzVzZuYd29gFuzOxNZsHJeyK1TjoVsWLkv6OYu10ARrJIXdvNVsvtiWKUXcHNUuvNHsJ5cyOn2ZNePYT29oNPq6Y6rYNVc2PFXs9tqWLUHcJzV7rQJrBYHcTy12GUzWIBxzVCrHTaFBRiXci131xwWYFyKtd5ZCCzAuJSK2FUYLMC4FIraUSgswLiYi9xNOCzAuBiL3kkXWIBxMdVjF91gAcbFUK8ddIUFGNfIes6+OyzAuEbUe+ZDYAHG1bMRsx4GCzCuHo2a8VBYgHFFNnK2w2EBxhXR6JlSwALGD2KmGGZJAwvgGIh6LDOkggXwDEYxptnRwQK4BqQS28woYQF8g2KOcVa0sADOgbHFOiNqWADv4Bhing09LIB7gKNin4kELIB/kD1TmIUMLEBjoNGpzEAKFqAz2IiU7l0OFqA14Fap3bMkLEBv0DUp3qssLEBz4KWp3qM0LEB38Dkp35s8LEB7AWep39MUsAD9RXw2w71MAwuYYyEz3AMwGSxAezHKZ983HSxAc0GKZ75qSliA1qKUzprbtLAAjYUpnPFJU8MCuBfHfLbapocFcC6Q8UwtWwIWwLVIprNEtQwsgGOhDGfo0VKwgLGLXQUVsCAsYMyCV0IFLAoL6Lvo1VABC8MC+ix8RVTA4rCA2MWvigowLAAxAFZGBRjW31pCWB0VYFi/agHCqH4yrF01MIzq/wzroCdAjOp3hnVSCRSj+jfDuigHjFEdZ1g3XcExqvMMK6MjQEZ1nWFl9gnJqO4zrIJSSkaVmWEVZFj5GVZm/lRYlmFl5C/eyzOsm/zthmcZ1kX+BunzDOsk/5NOXYZ1kP8Ruj7D2uUfm2mTYX3kH/Rrl2H9yT+a3DbDgn+ZIqLlYfnXv2JaGpZ/YTWuZWH5V+xjWxKW/1OQ+JaD5f/GqE9LwWJYLMMZerQMLKaFMp0lqiVgMS6S8Uwtmx4W8wKZz1bb1LAUFqdwxidNC0tpYUpnzW1KWIqLUjzzVdPBUl6Q8tn3TQVrhsXMcA/ARLBmWQgwx71MAWuGRexTvyd5WOoLuEr53qRhKQ8+N9V7lIWlOvAnKd6rJCzFQdemds9ysNQG3DKle5eCpTTYqFRmIANLZaA9UpiFBCyFQfaOfSb0sNgHODLm2VDDYh4cS6wzooXFOjDGGGdFCYtxUOyxzYwOFtuAlGKaHRUspsGoxjJDGlgsA5khhllSwGIYxGyNnulwWKMHMHMjZzsUllHFN2rGw2AZVb9GzHoILKPqX++Zd4dlVOPqOfuusIxqfL120A2WUfHUYxddYBkVX9E7CYdlVLxF7iYUllHxF7WjMFhGpVPErkJgGZVerXfWHJZR6dZyd01hGZV+rXbYDJZRzVOLXTaBZVTzVbvTalhGNW81u62CZVTz93THj2EZ1To92fUjWEa1XqU7L4ZlVOtWsvsiWEblcg1kwzKquF6v1+nb94+r9/e6/tvC1fWzYBlVTHcorrAcva8UV+T1b2EZVXwRi92DeQLo7vp7G9mwjKpPuZ+K7p5z9TGlSHOv/2kkC5ZR9Sv3U9gdlLO33b1+7fU/v+Z6dwjLqPqmDgv4MXMJy6j6V4Kk5Dk1nwprr/8LllH1rfbbCTnPPft71PXfhv7CMirXqpTSD6w/f/DDj2aPlBL+A96ddAreKL7XAAAAAElFTkSuQmCC'
			}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('New entrant '+randomFirst+' '+randomLast+' was created',responseObj.success);

			done();
		});
	});

});

describe('/api/entrants/switch endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/entrants/switch', form: {id: existentEntrantId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/entrants/switch', form: {id: existentEntrantId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user is not admin', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/entrants/switch', form: {id: existentEntrantId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Permission denied',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if department with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/entrants/switch', form: {id: nonExistentId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Entrant with id '+nonExistentId+' was not found',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/entrants/switch', form: {ido: existentEntrantId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error[0]);

			done();
		});
	});

	it('should return success if user is admin, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/entrants/switch', form: {id: existentEntrantId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('Entrant id '+existentEntrantId+' participation was switched',responseObj.success);

			existentEntrantId++;

			done();
		});
	});

});

describe('/api/analytics/data endpoint', function() {
	it('should return error if user token is missing', function(done) {
		request.post({url: baseUrl+'/api/entrants/remove', form: {id: existentEntrantId, user_token: ''}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user token does not exist', function(done) {
		request.post({url: baseUrl+'/api/entrants/remove', form: {id: existentEntrantId, user_token: 'aa'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Unknown user',responseObj.error);

			done();
		});
	});

	it('should return error if logged in user is not admin', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'user1@email.email', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/entrants/remove', form: {id: existentEntrantId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Permission denied',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if department with provided id does not exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/entrants/remove', form: {id: nonExistentId, user_token: token}}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Entrant with id '+nonExistentId+' was not found',responseObj.error[0]);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/api/entrants/remove', form: {ido: existentEntrantId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Missing mandatory request params',responseObj.error[0]);

			done();
		});
	});

	it('should return success if user is admin, token exists, all request params are present', function(done) {
		request.post({url: baseUrl+'/api/entrants/remove', form: {id: existentEntrantId, user_token: token}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.success).to.be.not.a('undefined');
			assert.equal('Entrant with id '+existentEntrantId+' was removed',responseObj.success);

			done();
		});
	});

});

describe('/api/analytics/data endpoint', function() {

	it('should return error if user token is missing', function(done) {
		request(baseUrl+'/api/analytics/data?user_token=', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user is not logged in', function(done) {
		request(baseUrl+'/logout?user_token='+token, function(error,response,body) {
			request(baseUrl+'/api/analytics/data?user_token='+token, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Unknown user',responseObj.error);

				done();
			});
		});
	});

	it('should return all existing entrants from db if user is logged in, at least one entrant (test one) must exist', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.get({url: baseUrl+'/api/analytics/data?user_token='+token}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(200);
				assert.notEqual(0,JSON.parse(response.body).length);

				done();
			});
		});
	});

	it('entrants object item must have defined properties', function(done) {
		request.get({url: baseUrl+'/api/analytics/data?user_token='+token}, function(error,response,body) {

			var responseObj = JSON.parse(response.body).entrants;
			expect(responseObj[0].id).to.be.not.a('undefined');
			expect(responseObj[0].participates).to.be.not.a('undefined');
			expect(responseObj[0].created).to.be.not.a('undefined');
			expect(responseObj[0].vendorId).to.be.not.a('undefined');

			done();
		});
	});

});

describe('/api/analytics/getreport endpoint', function() {

	it('should return error if user token is missing', function(done) {
		request.get(baseUrl+'/api/analytics/getreport?user_token=', function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(401);
			var responseObj = JSON.parse(response.body);
			expect(responseObj.error).to.be.not.a('undefined');
			assert.equal('Token missing \'user_token\'',responseObj.error);

			done();
		});
	});

	it('should return error if user is not logged in', function(done) {
		request.get(baseUrl+'/logout?user_token='+token, function(error,response,body) {
			request.get(baseUrl+'/api/analytics/getreport?user_token='+token, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(401);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Unknown user',responseObj.error);

				done();
			});
		});
	});

	it('should return error if mandatory post params are missing', function(done) {
		request.post({url: baseUrl+'/login', form: {email: 'admin@admin.admin', password: '000'}}, function(error,response,body) {
			token = JSON.parse(response.body).token;
			request.post({url: baseUrl+'/api/analytics/getreport?user_token='+token, eml: 'admin@admin.admin'}, function(error,response,body) {

				expect(error).to.be.not.ok;
				expect(response).to.be.not.a('undefined');
				expect(response.statusCode).to.be.equal(400);
				var responseObj = JSON.parse(response.body);
				expect(responseObj.error).to.be.not.a('undefined');
				assert.equal('Missing mandatory request parameters',responseObj.error);

				done();
			});
		});
	});

	it('should return detailed success message upon report sending', function(done) {
		this.timeout(20000);
		request.post({url: baseUrl+'/api/analytics/getreport', form: {user_token: token, email: 'admin@admin.admin'}}, function(error,response,body) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);

			var responseObj = JSON.parse(response.body);
			expect(responseObj.plainTextReport).to.be.not.a('undefined');
			expect(responseObj.htmlReport).to.be.not.a('undefined');
			expect(responseObj.downloadableReport).to.be.not.a('undefined');

			done();
		});
	});

});

describe('/app-diag/static endpoint', function() {
	it('should deliver static diagnostic information about the app platform', function (done){
		request(baseUrl+'/app-diag/static', function (error,response,body) {
			
			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
	
			const responseData = JSON.parse(response.body);
			
			assert.isArray(responseData);
			assert.equal(responseData.length, 7);
			for (let index in responseData) {
				if (responseData[index]) {
					assert.isObject(responseData[index]);
					expect(responseData[index]).to.have.all.keys(['name','value']);
				}
			}
			
			done();
		});
	});
});

describe('/app-diag/dynamic endpoint', function() {
	it('should deliver dynamic diagnostic information about the app platform', function (done){

		const ws = new webSocket('ws://localhost:8080/app-diag/dynamic');

		ws.on('open', (data) => {
			//console.log('ws connection opened', data);
			ws.send(JSON.stringify({action: 'get'}));
		});

		ws.on('message', (data, flags) => {
			//console.log('ws incoming message', data);
			expect(data).to.be.ok;
			const response = JSON.parse(data);
			assert.isArray(response);
			assert.equal(response.length, 2);
			for (let index in response) {
				if (response[index]) {
					assert.isObject(response[index]);
					expect(response[index]).to.have.all.keys(['name','value']);
				}
			}
			ws.close();
		});

		ws.on('close', () => {
			done();
		});
	});
});
