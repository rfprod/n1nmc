'use strict';

describe('appCore.adminPanel module', function() {

	beforeEach(module('appCore'));

	describe('Admin Panel controller', function(){
		var scope, state, filter, ctrl, confirm, uibModal, usSpinnerService, UserService, API;

		beforeEach(inject(function($rootScope, $controller, _$state_, _$filter_, _$confirm_, _$uibModal_, _usSpinnerService_, _UserService_, _API_) {
			scope = $rootScope.$new();
			state = _$state_;
			filter = _$filter_;
			confirm = _$confirm_;
			uibModal = _$uibModal_;
			API = _API_;
			usSpinnerService = _usSpinnerService_;
			UserService = _UserService_;
			ctrl = $controller('AdminPanelController', {$scope: scope, $state: state, $filter: filter, $confirm: confirm, $uibModal: uibModal, usSpinnerService: usSpinnerService, UserService: UserService, API: API});
		}));

		it('should be difined', function(){
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
				filterByControlMessage: undefined,
				filterByLogin: undefined,
				filterByFirstName: undefined,
				filterByLastName: undefined,
				filterByRole: undefined
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
			expect(scope.switchEntrantState).toBeDefined();
			expect(scope.deleteEntrant).toBeDefined();

			expect(scope.accounts).toEqual(jasmine.any(Array));
			expect(scope.accounts.length).toEqual(0);
			expect(scope.updateAccountsModel).toBeDefined();
			expect(scope.mode).toBeDefined();
			expect(scope.mode).toBeTruthy();
			expect(scope.selectMode).toBeDefined();
			expect(scope.editable).toEqual(jasmine.any(Object));
			expect(scope.editable).toEqual(jasmine.objectContaining({
				account: false,
				entrant: false
			}));
			expect(scope.selectedAccountId).toBeDefined();
			expect(scope.selectedAccountId).toBeFalsy();
			expect(scope.selectedAccountObj).toEqual(jasmine.any(Object));
			expect(scope.editAccount).toBeDefined();
			expect(scope.cancelEditAccount).toBeDefined();
			expect(scope.saveEditedAccount).toBeDefined();
			expect(scope.modalInstance).toBeUndefined();
			expect(scope.addAccount).toBeDefined();
			expect(scope.deleteAccount).toBeDefined();
			expect(scope.resetAccountPassword).toBeDefined();
		});

	});
});
