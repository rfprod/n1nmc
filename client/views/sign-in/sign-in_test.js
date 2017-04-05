'use strict';

describe('appCore.signIn module', function() {

	beforeEach(module('appCore'));

	describe('Sign In controller', function() {
		var scope, state, ctrl, API, UserService, usSpinnerService;

		beforeEach(inject(function($rootScope, _$state_, $controller, _API_, _UserService_, _usSpinnerService_) {
			scope = $rootScope.$new();
			state = _$state_;
			API = _API_;
			UserService = _UserService_;
			usSpinnerService = _usSpinnerService_;
			ctrl = $controller('SignInController', {$scope: scope, $state: state, API: API, UserService: UserService, usSpinnerService: usSpinnerService});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.displayError).toBeDefined();
			expect(scope.displayError).toBeFalsy();
			expect(scope.submitted).toBeDefined();
			expect(scope.submitted).toBeFalsy();
			expect(scope.email).toBeDefined();
			expect(scope.email).toEqual('');
			expect(scope.password).toBeDefined();
			expect(scope.password).toEqual('');
			expect(scope.user).toEqual(UserService);
			expect(scope.signUserIn).toBeDefined();
		});

	});
});
