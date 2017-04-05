'use strict';

describe('appCore.profile module', function() {

	beforeEach(module('appCore'));

	describe('Profile controller', function() {
		var scope, state, ctrl, API, UserService, usSpinnerService;

		beforeEach(inject(function($rootScope, $controller, _$state_, _$confirm_, _UserService_, _API_, _usSpinnerService_) {
			scope = $rootScope.$new();
			state = _$state_;
			API = _API_;
			UserService = _UserService_;
			usSpinnerService = _usSpinnerService_;
			ctrl = $controller('ProfileController', {$scope: scope, $state: state, UserService: UserService, API: API, usSpinnerService: usSpinnerService});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.displayError).toBeUndefined();
			expect(scope.isLoggedIn).toBeDefined();
			expect(scope.isLoggedIn).toBeFalsy();
			expect(scope.submitted).toBeDefined();
			expect(scope.submitted).toBeFalsy();
			expect(scope.loading).toBeDefined();
			expect(scope.loading).toBeTruthy();
			expect(scope.user).toEqual(UserService);

			expect(scope.userInitObj).toEqual(jasmine.any(Object));
			expect(scope.userInitObj.id).toBeUndefined();
			expect(scope.userInitObj.firstName).toBeUndefined();
			expect(scope.userInitObj.lastName).toBeUndefined();
			expect(scope.userInitObj.email).toBeUndefined();

			expect(scope.userUpdateObj).toEqual(jasmine.any(Object));
			expect(scope.userUpdateObj.id).toBeUndefined();
			expect(scope.userUpdateObj.firstName).toBeUndefined();
			expect(scope.userUpdateObj.lastName).toBeUndefined();
			expect(scope.userUpdateObj.email).toBeUndefined();

			expect(scope.userKeys).toEqual(jasmine.any(Array));
			expect(scope.userKeys.length).toBeGreaterThan(0);

			expect(scope.userUpdateObjKeys).toEqual(jasmine.any(Array));
			expect(scope.userUpdateObjKeys.length).toBeGreaterThan(0);

			expect(scope.password).toEqual(jasmine.any(Object));
			expect(scope.password.currentPass).toBeUndefined();
			expect(scope.password.newPass).toBeUndefined();

			expect(scope.enableSendButton).toBeDefined();
			expect(scope.passwordConfirmation).toBeUndefined();
			expect(scope.passwordResetMode).toBeDefined();
			expect(scope.passwordResetMode).toBeFalsy();
			expect(scope.updateUserToken).toBeDefined();
			expect(scope.getUser).toBeDefined();
			expect(scope.resetChanges).toBeDefined();
			expect(scope.switchMode).toBeDefined();
			expect(scope.update).toBeDefined();
		});

	});
});
