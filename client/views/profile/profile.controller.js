'use strict';

angular.module('appCore.profile', [])

.controller('ProfileController', ['$rootScope', '$scope', '$state', '$confirm', 'UserService', 'API', 'usSpinnerService',
	function($rootScope, $scope, $state, $confirm, UserService, API, usSpinnerService){
		$scope.displayError = undefined;
		$scope.submitted = false;
		$scope.loading = true;
		$scope.$watch('loading',function(newValue) {
			if (newValue) { usSpinnerService.spin('root-spinner'); }
			if (!newValue) { usSpinnerService.stop('root-spinner'); }
		});
		$scope.user = UserService;
		$scope.userInitObj = {
			id: undefined,
			firstName: undefined,
			lastName: undefined,
			email: undefined
		};
		$scope.userUpdateObj = {
			id: undefined,
			firstName: undefined,
			lastName: undefined,
			email: undefined
		};
		$scope.userKeys = Object.keys($scope.user.model);
		$scope.userUpdateObjKeys = Object.keys($scope.userUpdateObj);

		$scope.password = {
			currentPass: undefined,
			newPass: undefined
		};
		$scope.enableSendButton = function() {
			for (var key in $scope.userUpdateObjKeys){
				console.log('$scope.userUpdateObjKeys[key]', $scope.userUpdateObjKeys[key]);
				console.log('$scope.userUpdateObj[$scope.userUpdateObjKeys[key]]', $scope.userInitObj[$scope.userUpdateObjKeys[key]]);
				console.log('$scope.user.model[$scope.userUpdateObjKeys[key]]', $scope.user.model[$scope.userUpdateObjKeys[key]]);
				if ($scope.userInitObj[$scope.userUpdateObjKeys[key]] !== $scope.user.model[$scope.userUpdateObjKeys[key]]) {
					return true;
				}
			}
			return false;
		};
		$scope.passwordConfirmation = undefined;
		$scope.passwordResetMode = false;
		$scope.updateUserToken = function(response) {
			var responseHeaders = response.$httpHeaders();
			//console.log('response headers',responseHeaders);
			if (responseHeaders.usertokenupdate) {
				console.log('updated user token',responseHeaders.usertokenupdate);
				$scope.user.model.token = responseHeaders.usertokenupdate;
				$rootScope.$broadcast('saveuser');
			}
		};
		$scope.getUser = function(){
			$scope.loading = true;
			$scope.userUpdateObjKeys.forEach(function(key) {
				$scope.userUpdateObj[key] = undefined;
				$scope.userInitObj[key] = undefined;
			});
			API.GetMeService().query({user_token: $scope.user.model.token}).$promise.then(
				function(response) {
					console.log('Get Me Service, response', response);
					$scope.updateUserToken(response);
					if (!response.error) {
						var userDetails = response[0];
						$scope.user.model.id = userDetails.id;
						$scope.user.model.login = userDetails.login;
						$scope.user.model.firstName = userDetails.firstName;
						$scope.user.model.lastName = userDetails.lastName;
						$scope.user.model.email = userDetails.email;
						$scope.user.model.role = userDetails.role;
						$rootScope.$broadcast('saveuser');

						$scope.userInitObj.id = userDetails.id;
						$scope.userInitObj.firstName = userDetails.firstName;
						$scope.userInitObj.lastName = userDetails.lastName;
						$scope.userInitObj.email = userDetails.email;
					} else {
						console.log('Get Me Service, error:', response.error);
						$scope.displayError = response.error;
					}
					$scope.loading = false;
				},
				function(error) {
					console.log('Get Me Service, error:', error.error);
					$scope.displayError = error.error;
					$scope.loading = false;
				}
			);
		};

		$scope.resetChanges = function() {
			if ($scope.passwordResetMode) {
				$scope.password.currentPass = undefined;
				$scope.password.newPass = undefined;
				$scope.passwordConfirmation = undefined;
			} else {
				$rootScope.$broadcast('restoreuser');
			}
		};

		$scope.$watchCollection('user.model',function(newValues, oldValues) { // eslint-disable-line no-unused-vars
			$scope.userUpdateObj.id = newValues.id;
			$scope.userUpdateObj.firstName = newValues.firstName;
			$scope.userUpdateObj.lastName = newValues.lastName;
			$scope.userUpdateObj.email = newValues.email;

			console.log('user update obj: ',$scope.userUpdateObj);
		});

		$scope.switchMode = function() {
			$scope.submitted = false;
			if ($scope.passwordResetMode) { $scope.passwordResetMode = false; }
			else { $scope.passwordResetMode = true; }
		};
		$scope.update = function(isValid) {
			$scope.submitted = true;
			if (isValid){
				$scope.loading = true;
				if ($scope.passwordResetMode) {
					var params = {
						id: $scope.user.model.id,
						currentPass: $scope.password.currentPass,
						newPass: $scope.password.newPass,
						user_token: $scope.user.model.token
					};
					API.ChangeSelfPasswordService().save(params).$promise.then(
						function(response) {
							$scope.displayError = undefined;
							if (response.success) {
								$scope.password.currentPass = undefined;
								$scope.password.newPass = undefined;
								$scope.passwordConfirmation = undefined;
								$confirm({
									title: 'Your password was successfully changed',
									text: response.success,
									ok: 'OK',
									cancel: 'Cancel'
								}).then(function() {
									console.log(response.success);
								});
							} else {
								console.log('ChangeSelfPasswordService, error: ', response.error);
								$scope.displayError = response.error;
							}
							$scope.submitted = false;
							$scope.loading = false;
						},
						function(error) {
							console.log('ChangeSelfPasswordService, error: ', error);
							$scope.displayError = error;
							$scope.loading = false;
						}
					);
				} else {
					params = { user_token: $scope.user.model.token };
					$scope.userUpdateObjKeys.forEach(function(key) {
						params[key] = $scope.userUpdateObj[key];
					});
					API.UpdateSelfService().save(params).$promise.then(
						function(response) {
							$scope.displayError = undefined;
							if (response.success) {
								$scope.getUser();
							} else {
								console.log('UpdateSelfService, error: ', response.error);
								$scope.displayError = response.error;
							}
							$scope.submitted = false;
							$scope.loading = false;
						},
						function(error) {
							console.log('UpdateSelfService, error: ', error);
							$scope.displayError = error;
							$scope.loading = false;
						}
					);
				}
			}
		};

		$scope.$on('$viewContentLoaded', function() {
			console.log('Profile controller loaded');
			$rootScope.$broadcast('restoreuser');
			$scope.getUser();
		});
		$scope.$on('$destroy', function() {
			console.log('Profile controller destroyed');
		});
	}
]);
