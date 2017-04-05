'use strict';

describe('appCore.nav module', function() {

	beforeEach(module('appCore'));

	describe('Nav controller', function() {
		var scope, state, ctrl, UserService, API;

		beforeEach(inject(function($rootScope, $controller, _$state_, _UserService_, _API_) {
			scope = $rootScope.$new();
			state = _$state_;
			state.current.name = 'test';
			API = _API_;
			UserService = _UserService_;
			ctrl = $controller('NavigationController', {$scope: scope, $state: state, UserService: UserService, API: API});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function() {
			expect(scope.user).toBeDefined();
			expect(scope.isAdmin).toBeDefined();
			expect(scope.showNavigation).toBeDefined();
			expect(scope.hasOwnProperty('navToggler')).toBeTruthy();
			expect(scope.collapseNavbar).toBeDefined();
			expect(scope.collapseNavbar).toBeFalsy();
			expect(scope.toggleNavbarCollapse).toBeDefined();
			expect(scope.logout).toBeDefined();
		});

	});
});
