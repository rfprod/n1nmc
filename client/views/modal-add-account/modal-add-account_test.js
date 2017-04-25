'use strict';

describe('appCore.modals module', function() {

	beforeEach(module('appCore'));

	describe('Modal Add Account controller', function() {
		var scope, ctrl, userToken, uibModalInstance;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			uibModalInstance = jasmine.createSpyObj('uibModalInstance', ['close','dismiss','result.then']);
			userToken = 'test-token';
			ctrl = $controller('ModalAddAccountController', {$scope: scope, $uibModalInstance: uibModalInstance, userToken: userToken});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.newAccount).toEqual(jasmine.any(Object));
			expect(scope.newAccount).toEqual(jasmine.objectContaining({
				email: undefined,
				firstName: undefined,
				lastName: undefined,
				role: undefined,
				user_token: userToken
			}));
			expect(scope.regex).toEqual(jasmine.any(Object));
			expect(scope.regex.email).toEqual(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{1,}$/);
			expect(scope.roles).toEqual(jasmine.any(Object));
			expect(scope.roles.admin).toEqual('admin');
			expect(scope.roles.user).toEqual('user');
			expect(scope.disableOkButton).toBeDefined();
			expect(scope.ok).toBeDefined();
			expect(scope.cancel).toBeDefined();
		});

	});
});
