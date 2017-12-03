'use strict';

angular.module('appCore.signIn', [])

	.controller('SignInController', ['$rootScope', '$scope', '$state', 'API', 'UserService', 'usSpinnerService',

		function($rootScope, $scope, $state, API, UserService, usSpinnerService) {
			$scope.displayError = false;
			$scope.loading = true;
			$scope.$watch('loading',function(newValue) {
				if (newValue) { usSpinnerService.spin('root-spinner'); }
				if (!newValue) { usSpinnerService.stop('root-spinner'); }
			});
			$scope.submitted = false;
			$scope.email = '';
			$scope.password = '';
			$scope.user = UserService;
			$scope.signUserIn = function(isFormValid) {
				$scope.submitted = true;
				if (isFormValid) {
					$scope.loading = true;
					console.log('Trying to sign a user in with credentials: ', $scope.email, ' | ', $scope.password);
					API.AuthService().query({'email': $scope.email, 'password': $scope.password}).$promise.then(
						function(response) {
							console.log('Auth Service, response', response);
							if (response.token) {
								console.log('Auth Service: success');
								$scope.user.model.token = response.token;
								$rootScope.$broadcast('saveuser');
								API.GetMeService().query({user_token: $scope.user.model.token}).$promise.then(function(response) {
									console.log('Get Me Service, response', response);
									if (!response.error) {
										var userDetails = response[0];
										$scope.user.model.id = userDetails.id;
										$scope.user.model.login = userDetails.login;
										$scope.user.model.firstName = userDetails.firstName;
										$scope.user.model.lastName = userDetails.lastName;
										$scope.user.model.email = userDetails.email;
										$scope.user.model.role = userDetails.role;
										$rootScope.$broadcast('saveuser');

										if ($scope.user.model.role === 'admin') $state.go('app.admin.dashboard');
										else $state.go('app.user.dashboard');

									} else {
										console.log('Get Me Service, error:', response.error);
										$scope.displayError = response.error;
									}
								});
							} else {
								console.log('Auth Service, error:', response.error);
								$scope.displayError = response.error;
							}
							$scope.loading = false;
						},
						function(error) {
							console.log('Auth Service, error:', error.error);
							$scope.displayError = error.error;
							$scope.loading = false;
						}
					);
				}
			};
			$scope.$on('$viewContentLoaded', function(event) {
				console.log('Sign In Controller loaded: ', event);
				$rootScope.$broadcast('restoreuser');
				if ($scope.user.model) {
					if ($scope.user.model.token !== '') {
						if ($scope.user.model.role === 'admin') $state.go('app.admin.dashboard');
						if ($scope.user.model.role === 'user') $state.go('app.user.dashboard');
					}
				}
				$scope.loading = false;
			});
			$scope.$on('$destroy', function(event) {
				console.log('Sign In Controller destroyed: ', event);
			});
		}
	]);
