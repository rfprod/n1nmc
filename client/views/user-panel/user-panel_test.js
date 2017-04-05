'use strict';

describe('appCore.userPanel module', function() {

	beforeEach(module('appCore'));

	describe('User Panel controller', function(){
		var scope, state, ctrl, filter, UserService, API, usSpinnerService;

		beforeEach(inject(function($rootScope, $controller, _$state_, _$filter_, _UserService_, _API_, _usSpinnerService_) {
			scope = $rootScope.$new();
			state = _$state_;
			filter = _$filter_;
			UserService = _UserService_;
			API = _API_;
			usSpinnerService = _usSpinnerService_;
			ctrl = $controller('UserPanelController', {$scope: scope, $state: state, $filter: filter, UserService: UserService, API: API, usSpinnerService: usSpinnerService});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.displayError).toBeUndefined();
			expect(scope.loading).toBeDefined();
			expect(scope.loading).toBeTruthy();
			expect(scope.displayModal).toBeDefined();
			expect(scope.displayModal).toBeFalsy();
			expect(scope.isLoggedIn).toBeDefined();
			expect(scope.isLoggedIn).toBeFalsy();
			expect(scope.user).toEqual(UserService);
			expect(scope.updateUserToken).toBeDefined();
			expect(scope.filters).toEqual(jasmine.any(Object));
			expect(scope.filters).toEqual(jasmine.objectContaining({
				dateRangeStart: undefined,
				filterById: undefined,
				filterByDate: undefined,
				filterByParticipation: undefined,
				filterByFullName: undefined,
				filterByEmail: undefined,
				filterByPhone: undefined,
				filterByControlAmount: undefined,
				filterByControlVendorId: undefined,
				filterByControlMessage: undefined
			}));

			expect(scope.dateTimePickerConfig).toBeDefined();
			expect(scope.dateTimePickerConfig.dropdownSelector).toEqual('#dropdown1');
			expect(scope.dateTimePickerConfig.minView).toEqual('day');
			expect(scope.beforeRenderStartDate).toBeDefined();

			expect(scope.urlParams).toEqual(jasmine.any(Object));
			expect(scope.urlParams.page).toEqual(0);
			expect(scope.urlParams.size).toEqual(10);
			
			expect(scope.total).toEqual(jasmine.any(Object));
			expect(scope.total.pages).toEqual(0);
			expect(scope.total.elements).toEqual(0);
			
			expect(scope.pages).toEqual(jasmine.any(Array));
			expect(scope.pagerCallback).toBeDefined();

			expect(scope.entrants).toEqual(jasmine.any(Array));
			
			expect(scope.query).toEqual(jasmine.any(Object));
			expect(scope.query.entrants).toEqual(jasmine.any(Object));
			expect(scope.query.entrants.limit).toEqual(0);
			expect(scope.query.entrants.offset).toEqual(0);
			expect(scope.query.entrants.user_token).toEqual(scope.user.model.token);
			
			expect(scope.updateEntrantsModel).toBeDefined();
		});

	});
});
