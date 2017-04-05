'use strict';

describe('appCore.analytics module', function() {

	beforeEach(module('appCore'));

	describe('Analytics controller', function() {
		var scope, state, filter, ctrl, usSpinnerService, UserService, API;

		beforeEach(inject(function($rootScope, _$state_, _$filter_, $controller, _usSpinnerService_, _UserService_, _API_) {
			scope = $rootScope.$new();
			state = _$state_;
			filter = _$filter_;
			usSpinnerService = _usSpinnerService_;
			UserService = _UserService_;
			API = _API_;
			ctrl = $controller('AnalyticsController', {$scope: scope, $state: state, $filter: filter, usSpinnerService: usSpinnerService, UserService: UserService, API: API});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.displayError).toBeUndefined();
			expect(scope.displayModal).toBeDefined();
			expect(scope.displayModal).toBeFalsy();
			expect(scope.toggleModal).toBeDefined();
			expect(scope.loading).toBeDefined();
			expect(scope.loading).toBeFalsy();
			expect(scope.user).toEqual(UserService);
			expect(scope.updateUserToken).toBeDefined();
			expect(scope.reportSuccessfullySent).toBeDefined();
			expect(scope.reportSuccessfullySent).toBeFalsy();
			expect(scope.getReport).toBeDefined();

			expect(scope.options_1).toEqual(jasmine.any(Object));
			expect(scope.options_1).toEqual(jasmine.objectContaining({
				chart: jasmine.any(Object),
				title: jasmine.any(Object),
				subtitle: jasmine.any(Object),
				caption: jasmine.any(Object)
			}));
			expect(scope.data_1).toEqual(jasmine.any(Array));
			expect(scope.data_1.length).toEqual(2);

			expect(scope.options_2).toEqual(jasmine.any(Object));
			expect(scope.options_2).toEqual(jasmine.objectContaining({
				chart: jasmine.any(Object),
				title: jasmine.any(Object),
				subtitle: jasmine.any(Object),
				caption: jasmine.any(Object)
			}));
			expect(scope.data_2).toEqual(jasmine.any(Array));
			expect(scope.data_2.length).toEqual(1);

			expect(scope.analyticData).toEqual(jasmine.any(Object));
			expect(scope.analyticData.entrants).toEqual(jasmine.any(Array));
			expect(scope.updateAnalyticDataModel).toBeDefined();
			expect(scope.parseAnalyticData).toBeDefined();

		});

	});
});

