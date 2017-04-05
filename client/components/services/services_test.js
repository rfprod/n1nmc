'use strict';

describe('appCore services: ', function() {

	beforeEach(module('appCore'));

	var scope, UserService, Auth, TokenInterceptor, API, httpBackend; // eslint-disable-line no-unused-vars

	describe('UserService', function() {

		beforeEach(inject(function($rootScope, _UserService_) {
			scope = $rootScope.$new();
			UserService = _UserService_;
		}));

		it('service must be defined', function() {
			expect(UserService).toBeDefined();
		});

		it('must have methods: store, retrieve, clear', function() {
			expect(UserService.model).toBeDefined();
			expect(UserService.SaveUser).toBeDefined();
			expect(UserService.RestoreUser).toBeDefined();
			expect(UserService.ResetUser).toBeDefined();
		});

		it('must perform Save, Restore, Reset actions correctly', function() {
			expect(UserService.model).toEqual(jasmine.objectContaining({
				id: '', login: '', firstName: '', lastName: '', email: '', role: '', token: ''
			}));
		// Save
			UserService.model.id = 'test';
			expect(UserService.model.id).toEqual('test');
			expect(sessionStorage.userService).toBeUndefined();
			UserService.SaveUser();
			expect(JSON.parse(sessionStorage.userService)).toEqual(UserService.model);
		// Restore
			UserService.model.id = 'zzz';
			expect(UserService.model.id).toEqual('zzz');
			expect(JSON.parse(sessionStorage.userService)).not.toEqual(UserService.model);
			expect(sessionStorage.userService).toBeDefined();
			UserService.RestoreUser();
			expect(JSON.parse(sessionStorage.userService)).toEqual(UserService.model);
		// Reset
			UserService.model.id = 'id';
			UserService.model.login = 'login';
			UserService.model.firstName = 'firstName';
			UserService.model.lastName = 'lastName';
			UserService.model.email = 'email';
			UserService.model.role = 'role';
			UserService.model.token = 'token';
			expect(UserService.model).toEqual(jasmine.objectContaining({
				id: 'id',
				login: 'login',
				firstName: 'firstName',
				lastName: 'lastName',
				email: 'email',
				role: 'role',
				token: 'token'
			}));
			UserService.SaveUser();
			expect(JSON.parse(sessionStorage.userService)).toEqual(UserService.model);
			UserService.ResetUser();
			expect(UserService.model).toEqual(jasmine.objectContaining({
				id: '', login: '', firstName: '', lastName: '', email: '', role: '', token: ''
			}));
			expect(JSON.parse(sessionStorage.userService)).toEqual(UserService.model);
		});

	});

	describe('Auth', function() {

		beforeEach(inject(function($rootScope, _Auth_, _UserService_) {
			scope = $rootScope.$new();
			Auth = _Auth_;
			UserService = _UserService_;
			spyOn(UserService, 'RestoreUser').and.callFake(function() { return true; });
		}));

		it('service must be defined', function() {
			expect(Auth).toBeDefined();
		});

		it('must have methods: authenticated', function() {
			expect(Auth.authenticated).toBeDefined();
		});

		it('must call TokenStorage methods on respective Auth methods calls', function() {
			Auth.authenticated();
			expect(UserService.RestoreUser).toHaveBeenCalled();
		});

	});

	describe('TokenInterceptor', function() {

		beforeEach(inject(function($rootScope, _TokenInterceptor_, _UserService_) {
			scope = $rootScope.$new();
			TokenInterceptor = _TokenInterceptor_;
			UserService = _UserService_;
			spyOn(UserService, 'RestoreUser').and.callFake(function() { return true; });
			spyOn(UserService, 'SaveUser').and.callFake(function() { return true; });
		}));

		it('service must be defined', function() {
			expect(TokenInterceptor).toBeDefined();
		});

		it('must have methods: request, response, responseError', function() {
			expect(TokenInterceptor.request).toBeDefined();
			expect(TokenInterceptor.response).toBeDefined();
			expect(TokenInterceptor.responseError).toBeDefined();
		});

		it('must call UserService methods on respective TokenInterceptor methods calls', function() {
			var error = { status: 400 };
			TokenInterceptor.responseError(error);
			expect(UserService.RestoreUser).not.toHaveBeenCalled();
			expect(UserService.SaveUser).not.toHaveBeenCalled();
			error.status = 401;
			TokenInterceptor.responseError(error);
			expect(UserService.RestoreUser).not.toHaveBeenCalled();
			expect(UserService.SaveUser).not.toHaveBeenCalled();
			error.status = 403;
			TokenInterceptor.responseError(error);
			expect(UserService.RestoreUser).not.toHaveBeenCalled();
			expect(UserService.SaveUser).not.toHaveBeenCalled();

			var requestConfig = { headers: {'X-AUTH-TOKEN': ''} };
			TokenInterceptor.request(requestConfig);
			expect(UserService.RestoreUser).toHaveBeenCalled();

			var responseConfig = { headers: {'usertokenupdate': 'test'} };
			TokenInterceptor.response(responseConfig);
			expect(UserService.SaveUser).toHaveBeenCalled();
		});

	});

	describe('httpServices', function() {

		beforeEach(inject(function(_API_, $httpBackend) {
			API = _API_;
			httpBackend = $httpBackend;
		}));

		it('should have an API service with defined methods', function() {
			expect(API).toBeDefined();
			expect(API.AuthService).toBeDefined();
			expect(API.LogOutService).toBeDefined();
			expect(API.GetMeService).toBeDefined();
			expect(API.UpdateSelfService).toBeDefined();
			expect(API.ChangeSelfPasswordService).toBeDefined();
			expect(API.UserAccountsService).toBeDefined();
			expect(API.NewUserService).toBeDefined();
			expect(API.EditUserService).toBeDefined();
			expect(API.ResetUserPasswordService).toBeDefined();
			expect(API.DeleteUserService).toBeDefined();
			expect(API.EntrantsService).toBeDefined();
			expect(API.NewEntrantService).toBeDefined();
			expect(API.SwitchEntrantService).toBeDefined();
			expect(API.DeleteEntrantService).toBeDefined();
			expect(API.AnalyticDataService).toBeDefined();
			expect(API.GetReportService).toBeDefined();
		});

	});

});
