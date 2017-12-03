'use strict';

angular.module('appCore.adminPanel', ['ui.bootstrap.tpls', 'ui.bootstrap.modal'])

	.controller('AdminPanelController', ['$rootScope', '$scope', '$state', '$filter', '$uibModal', 'usSpinnerService', 'UserService', 'API',

		function($rootScope, $scope, $state, $filter, $uibModal, usSpinnerService, UserService, API) {
			$scope.displayError = undefined;
			$scope.loading = true;
			$scope.$watch('loading', function(newValue) {
				if (newValue) { usSpinnerService.spin('root-spinner'); }
				if (!newValue) { usSpinnerService.stop('root-spinner'); }
			});
			$scope.displayModal = false;
			$rootScope.$on('displayModal', function(event) {
				console.log('displayModal catched', event);
				$scope.displayModal = ($scope.displayModal) ? false : true;
			});

			$scope.user = UserService;
			$scope.updateUserToken = function(response) {
				var responseHeaders = response.$httpHeaders();
				//console.log('response headers',responseHeaders);
				if (responseHeaders.usertokenupdate) {
					console.log('updated user token', responseHeaders.usertokenupdate);
					$scope.user.model.token = responseHeaders.usertokenupdate;
					$rootScope.$broadcast('saveuser');
				}
			};

			/*
			* PAGER
			*
			* paging functions are defined in directive
			* on button click directive calls $scope.pagerCallback method
			* which wraps an actual controller method to update paged data
			*/
			$scope.urlParams = {
				page: 0,
				size: 10
			};
			$scope.total = {
				pages: 0,
				elements: 0
			};
			$scope.pages = [];
			$scope.pagerCallback = function() {
				$scope.updateEntrantsModel();
			};
			$scope.$watch('total.pages',function(newValue) {
				if (newValue > 0) {
					$scope.pages = [];
					for (var i=0; i<$scope.total.pages; i++) {
						console.log(i);
						$scope.pages.push(i);
					}
					console.log('pages',$scope.pages);
				}
			});

			/*
			*	UI filters
			*/
			$scope.filters = {
				dateRangeStart: undefined,
				dateRangeEnd: new Date().toISOString(),
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
			};
			$scope.$watch('filters.dateRangeStart', function(newValue){
				if (typeof newValue !== 'undefined'){
					$scope.filters.filterByDate = $filter('convertDate')(newValue,'yyyy-mm-dd');
				}
			});
			/*
			*	DateTimePicker config
			*/
			$scope.dateTimePickerConfig = {
				dropdownSelector: '#dropdown1',
				minView: 'day'
			};
			$scope.beforeRenderStartDate = function($view, $dates, $leftDate, $upDate, $rightDate) {
				console.log('beforeRenderStartDate: ', $view, $dates, $rightDate, $upDate, $leftDate);
				if ($scope.filters.dateRangeEnd) {
					var activeDate = moment($scope.filters.dateRangeEnd);
					for (var i = 0; i < $dates.length; i++) {
						if ($dates[i].localDateValue() > activeDate.valueOf()) { $dates[i].selectable = false; }
					}
				}
			};

			$scope.entrants = [];
			$scope.query = {
				entrants: {
					limit: 0,
					offset: 0,
					user_token: $scope.user.model.token
				}
			};
			$scope.updateEntrantsModel = function() {
				console.log('updating entrants model');
				$scope.loading = true;
				$scope.query.entrants.limit = $scope.urlParams.size;
				$scope.query.entrants.offset = $scope.urlParams.size * $scope.urlParams.page;
				API.EntrantsService().query($scope.query.entrants).$promise.then(
					function(response) {
						if (!response.error) {
							$scope.updateUserToken(response);
							$scope.entrants = [];
							var responseData = response.data;
							for (var i=0; i<responseData.length; i++) {
								console.log(responseData[i]);
								responseData[i].created = $filter('convertDate')(responseData[i].created,'yyyy-mm-dd hh:mm:ss');
								$scope.entrants.push(responseData[i]);
							}
							$scope.total.pages = response.pages;
							$scope.total.elements = response.elements;
							$scope.displayError = undefined;
							console.log('EntrantsService, entrants model updated:',$scope.entrants);
						} else {
							console.log('EntrantsService, updateEntrantsModel: ',response.error);
							$scope.displayError = response.error;
						}
						$scope.loading = false;
					},
					function(error) {
						console.log('updateEntrantsModel: ',error.error);
						$scope.displayError = error.error;
						$scope.loading = false;
					}
				);
			};
			$scope.switchEntrantState = function(entrant, index) {
				$scope.loading = true;
				console.log('switch entrant state: ', entrant.id, entrant.participates, index);
				API.SwitchEntrantService().save({id: entrant.id, user_token: $scope.user.model.token}).$promise.then(
					function(response) {
						if (response.error) {
							$scope.displayError = response.error;
							$scope.entrants[index].participates = ($scope.entrants[index].participates) ? false : true;
						} else if (response.success) {
							$scope.updateUserToken(response);
							console.log('SwitchEntrantService, switched entrant state: ', response);
							if ($scope.displayError) { $scope.displayError = undefined; }
						}
						$scope.loading = false;
					},
					function(error) {
						console.log('SwitchEntrantService, switchEntrantState: ',error.error);
						$scope.displayError = error.error;
						$scope.loading = false;
					}
				);
			};
			$scope.deleteEntrant = function(id) {
				console.log('delete entrant id:', id);
				$scope.modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'views/modal-action-confirm/modal-action-confirm.html',
					controller: 'ModalActionConfirm',
					resolve: {
						modalData: function() {
							return {
								title: 'Подтвердите удаление записи участника',
								text: 'Идентификатор записи: ' + id + '. Это действие необратимо.',
								ok: 'Удалить запись',
								cancel: 'Отмена'
							};
						}
					}
				});
				$scope.modalInstance.result.then(function() {
					$scope.loading = true;
					var params = { id: id, user_token: $scope.user.model.token };
					console.log('confirmed entrant '+id+' deletion');
					$scope.loading = true;
					API.DeleteEntrantService().save(params).$promise.then(
						function(response) {
							if (!response.error) {
								$scope.updateUserToken(response);
								$scope.updateEntrantsModel();
								console.log('DeleteEntrantService, deleted entrant id:', id);
							} else {
								console.log('DeleteEntrantService, deleted entrant id:', id, 'error', response.error);
								$scope.displayError = response.error;
							}
							$scope.loading = false;
						},
						function(error) {
							console.log('DeleteEntrantService, deleted entrant id:', id, 'error', error.error);
							$scope.displayError = error.error;
							$scope.loading = false;
						}
					);
				}, function() {
					console.log('Modal dismissed at: ' + new Date());
				});
			};

			$scope.accounts = [];
			$scope.updateAccountsModel = function() {
				API.UserAccountsService().query({user_token: $scope.user.model.token}).$promise.then(
					function(response) {
						if (!response.error) {
							$scope.updateUserToken(response);
							$scope.accounts = [];
							for (var i=0; i<response.length; i++) {
								console.log(response[i]);
								response[i].lastLogin = $filter('convertDate')(response[i].lastLogin,'yyyy-mm-dd hh:mm:ss');
								$scope.accounts.push(response[i]);
							}
							$scope.displayError = undefined;
							console.log('UserAccountsService, accounts model updated:',$scope.accounts);
						} else {
							console.log('UserAccountsService, error:', response.error);
							$scope.displayError = response.error;
						}
						$scope.loading = false;
					},
					function(error) {
						console.log('UserAccountsService, error:', error.error);
						$scope.displayError = error.error;
						$scope.loading = false;
					}
				);
			};
			$scope.mode = true; // true - Entrants mode, false - Users mode
			$scope.selectMode = function() {
				$scope.mode = ($scope.mode) ? false : true;
			};
			$scope.editable = {
				account: false,
				entrant: false
			};
			$scope.selectedAccountId = false;
			$scope.selectedAccountObj = {};
			$scope.editAccount = function(id) {
				console.log('edit account, id:', id);
				$scope.selectedAccountId = id;
				for (var i in $scope.accounts) {
					if ($scope.accounts[i]) {
						var account = $scope.accounts[i];
						if (account.id == $scope.selectedAccountId) {
							// store in temp var to be able to revert changes
							var keys = Object.keys(account);
							for (var j in keys) {
								if (keys[j]) { $scope.selectedAccountObj[keys[j]] = account[keys[j]]; }
							}
						}
					}
				}
			};
			$scope.cancelEditAccount = function() {
				console.log('cancelling, discarding changes, id:', $scope.selectedAccountId);
				for (var i in $scope.accounts) {
					if ($scope.accounts[i]) {
						var account = $scope.accounts[i];
						if (account.id === $scope.selectedAccountId) {
							var keys = Object.keys(account);
							for (var j in keys) account[keys[j]] = $scope.selectedAccountObj[keys[j]];
						}
					}
				}
				$scope.selectedAccountId = false;
			};
			$scope.saveEditedAccount = function() {
				console.log('saving changes, id:', $scope.selectedAccountId);
				var newValuesObj = {};
				$scope.accounts.forEach(function(acc) {
					if (acc.id == $scope.selectedAccountId) { newValuesObj = acc; }
				});
				$scope.modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'views/modal-action-confirm/modal-action-confirm.html',
					controller: 'ModalActionConfirm',
					resolve: {
						modalData: function() {
							return {
								title: 'Подтвердите редактирование учётной записи',
								text: 'Старые значения: '+$scope.selectedAccountObj.id+'. '+$scope.selectedAccountObj.login+', '+$scope.selectedAccountObj.firstName+
									', '+$scope.selectedAccountObj.lastName+', '+$scope.selectedAccountObj.email+', '+$scope.selectedAccountObj.role+
									'. Новые значения: '+newValuesObj.id+'. '+newValuesObj.name+', '+newValuesObj.login+', '+newValuesObj.firstName+
									', '+newValuesObj.lastName+', '+newValuesObj.email+', '+newValuesObj.role+'. Это действие необратимо.',
								ok: 'Сохранить изменения',
								cancel: 'Отмена'
							};
						}
					}
				});
				$scope.modalInstance.result.then(function() {
					$scope.loading = true;
					var params = {};
					for (var i in $scope.accounts) {
						if ($scope.accounts[i]) {
							var account = $scope.accounts[i];
							if (account.id === $scope.selectedAccountId) {
								params['id'] = account.id;
								params['login'] = account.login;
								params['firstName'] = account.firstName;
								params['lastName'] = account.lastName;
								params['email'] = account.email;
								params['role'] = account.role;
								params['user_token'] = $scope.user.model.token;
							}
						}
					}
					API.EditUserService().save(params).$promise.then(
						function(response) {
							if (!response.error) {
								$scope.updateUserToken(response);
								console.log('EditUserService, success:', response.success);
							} else {
								console.log('EditUserService, error:', response.error);
								$scope.displayError = response.error;
							}
							$scope.loading = false;
						},
						function(error) {
							console.log('EditUserService, error:', error.error);
							$scope.displayError = error.error;
							$scope.loading = false;
						}
					);
					$scope.selectedAccountId = false;
				}, function() {
					console.log('Modal dismissed at: ' + new Date());
					$scope.selectedAccountId = false;
				});
			};
			$scope.modalInstance = undefined;
			$scope.addAccount = function() {
				console.log('create new account');
				$scope.modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'views/modal-add-account/modal-add-account.html',
					controller: 'ModalAddAccountController',
					resolve: {
						userToken: function() {
							return $scope.user.model.token;
						}
					}
				});
				$scope.modalInstance.result.then(function(params) {
					$scope.loading = true;
					console.log('newAccount object:', params);
					API.NewUserService().save(params).$promise.then(
						function(response) {
							if (!response.error) {
								console.log('NewUserService, success:', response.success);
								$scope.updateUserToken(response);
								$scope.updateAccountsModel();
								$scope.loading = false;
							} else {
								console.log('NewUserService, error:', response.error);
								$scope.displayError = response.error;
							}
						},
						function(error) {
							console.log('NewUserService, error:', error.error);
							$scope.displayError = error.error;
							$scope.loading = false;
						}
					);
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			};
			$scope.deleteAccount = function(id) {
				console.log('delete account id:', id);
				$scope.selectedAccountId = id;
				$scope.modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'views/modal-action-confirm/modal-action-confirm.html',
					controller: 'ModalActionConfirm',
					resolve: {
						modalData: function() {
							return {
								title: 'Подтвердите удаление учётной записи',
								text: 'Идентификатор учётной записи: ' + $scope.selectedAccountId + '. Это действие необратимо.',
								ok: 'Удалить запись',
								cancel: 'Отмена'
							};
						}
					}
				});
				$scope.modalInstance.result.then(function() {
					$scope.loading = true;
					var params = { id: $scope.selectedAccountId, user_token: $scope.user.model.token };
					console.log('confirmed account ' + $scope.selectedAccountId + ' deletion');
					API.DeleteUserService().save(params).$promise.then(
						function(response) {
							if (!response.error) {
								$scope.updateUserToken(response);
								$scope.updateAccountsModel();
								console.log('DeleteUserService, deleted account id:', $scope.selectedAccountId);
							} else {
								console.log('DeleteUserService, deleted account id:', $scope.selectedAccountId, 'error', response.error);
								$scope.displayError = response.error;
							}
							$scope.selectedAccountId = false;
							$scope.loading = false;
						},
						function(error) {
							console.log('DeleteUserService, deleted account id:', $scope.selectedAccountId, 'error', error.error);
							$scope.displayError = error.error;
							$scope.selectedAccountId = false;
							$scope.loading = false;
						}
					);
				}, function() {
					console.log('Modal dismissed at: ' + new Date());
					$scope.selectedAccountId = false;
				});
			};
			$scope.resetAccountPassword = function(id) {
				console.log('resetting password for the account id:', id);
				var selectedAccountId = id; // local variable is used here for reason - see admin panel template

				$scope.modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'views/modal-action-confirm/modal-action-confirm.html',
					controller: 'ModalActionConfirm',
					resolve: {
						modalData: function() {
							return {
								title: 'Подтвердите сброс пароля учётной записи',
								text: 'Идентификатор учётной записи: ' + id + '. Выбранному пользователю будет выслана ссылка для генерации нового пароля на электронную почту. Если пользователь не воспользуется ссылкой до следующего входа в систему с текущим паролем, высланная ссылка для сброса пароля перестанет быть действительной.',
								ok: 'Сбросить пароль',
								cancel: 'Отмена'
							};
						}
					}
				});
				$scope.modalInstance.result.then(function() {
					$scope.loading = true;
					var params = { id: id, user_token: $scope.user.model.token };
					console.log('params:', params);
					console.log('confirmed password reset procedure initialization for the account, id:', selectedAccountId);
					API.ResetUserPasswordService().save(params).$promise.then(
						function(response) {
							if (!response.error) {
								$scope.updateUserToken(response);
								console.log('ResetUserPasswordService, successful password reset init for the account, id:', selectedAccountId);
							} else {
								console.log('ResetUserPasswordService, password reset for the account id:', selectedAccountId, ' error', response.error);
								$scope.displayError = response.error;
							}
							$scope.loading = false;
						},
						function(error) {
							console.log('ResetUserPasswordService, password reset for the account id:', selectedAccountId, ' error', error.error);
							$scope.displayError = error.error;
							$scope.loading = false;
						}
					);
				}, function() {
					console.log('Modal dismissed at: ' + new Date());
				});
			};

			$scope.$on('$viewContentLoaded', function(event) {
				console.log('Admin Panel Controller loaded: ', event);
				$rootScope.$broadcast('restoreuser');
				if ($scope.user.model.role == 'admin') {
					$scope.updateEntrantsModel();
					$scope.updateAccountsModel();
				} else {
					$state.go('app.user.dashboard');
				}
			});
			$scope.$on('$destroy', function(event) {
				console.log('Admin Panel Controller destroyed: ', event);
			});
		}
	]);
