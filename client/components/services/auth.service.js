'use strict';

angular.module('appCore')

	.factory('Auth', ['UserService', function(UserService) {
		return {
			authenticated: function() {
				var user = UserService;
				UserService.RestoreUser();
				return (user.model.token);
			}
		};
	}])

	.factory('TokenInterceptor', ['$q', 'UserService', function($q, UserService) {
		var user = UserService;
		return {
			request: function(req) {
				user.RestoreUser();
				if (user.model.token) {
					req.headers['X-AUTH-TOKEN'] = user.model.token;
				}
				return req;
			},
			response: function(res) {
				console.log('TokenInterceptor response, "usertokenupdate" header:', res.headers['usertokenupdate']);
				if (res.headers['usertokenupdate']) {
					user.model.token = res.headers['usertokenupdate'];
					user.SaveUser();
				}
				return res;
			},
			responseError: function(err) {
				console.log('TokenInterceptor error:', err);
				if (err.status === 401 || err.status === 403) {
					console.log('do something on error');
				}
				//return $q.reject(error);
				return err;
			}
		};
	}]).config(['$httpProvider', function($httpProvider) {
		$httpProvider.interceptors.push('TokenInterceptor');
	}]);
