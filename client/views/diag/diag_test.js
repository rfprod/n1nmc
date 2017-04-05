'use strict';

describe('appCore.diag module', function() {

	beforeEach(module('appCore'));

	describe('Diag controller', function() {
		var scope, state, filter, ctrl, UserService, API; // eslint-disable-line no-unused-vars

		beforeEach(inject(function($rootScope, _$state_, _$filter_, $controller, _UserService_, _API_) {
			scope = $rootScope.$new();
			state = _$state_;
			filter = _$filter_;
			UserService = _UserService_;
			API = _API_;
			ctrl = $controller('DiagController', {$scope: scope, $state: state, UserService: UserService, API: API});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.displayError).toBeUndefined();
			expect(scope.enableDrawer).toBeDefined();
			expect(scope.enableDrawer).toBeFalsy();
			expect(scope.toggleDrawer).toBeDefined();
			expect(scope.loading).toBeDefined();
			expect(scope.loading).toBeFalsy();
			expect(scope.user).toEqual(UserService);
			expect(scope.updateUserToken).toBeDefined();

			expect(scope.appDiagData).toEqual(jasmine.any(Object));
			expect(scope.appDiagData).toEqual(jasmine.objectContaining({
				static: [],
				dynamic: []
			}));

		});

	});
});
