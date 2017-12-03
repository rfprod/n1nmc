'use strict';

angular.module('appCore.diag', [])

	.controller('DiagController', ['$rootScope', '$scope', '$filter', 'usSpinnerService', 'UserService', 'API',

		function($rootScope, $scope, $filter, usSpinnerService, UserService, API) {
			$scope.displayError = undefined;
			$scope.enableDrawer = false;
			$scope.loading = true;
			$scope.toggleDrawer = function() {
				$scope.enableDrawer = ($scope.enableDrawer) ? false : true;
				if ($scope.enableDrawer) {
					API.getAppDiagStaticData().query({}).$promise.then(
						function(response) {
							$scope.updateUserToken(response);
							if (!response.error){
								console.log('getAppDiagStaticData, response:', response);
								$scope.appDiagData.static = response;
								$scope.displayError = undefined;
							} else {
								console.log('getAppDiagStaticData, error: ', response.error);
								$scope.displayError = response.error;
							}
							$scope.loading = false;
						},
						function(error) {
							console.log('getAppDiagStaticData, error: ', error.error);
							$scope.displayError = error.error;
							$scope.loading = false;
						}
					);
					API.getAppDiagDynamicData().status();
					API.getAppDiagDynamicData().get();
				}else{
					API.getAppDiagDynamicData().pause();
				}
			};

			$scope.loading = false;
			$scope.$watch('loading', function(newValue) {
				if (newValue) { usSpinnerService.spin('root-spinner'); }
				if (!newValue) { usSpinnerService.stop('root-spinner'); }
			});

			$scope.user = UserService;
			$scope.updateUserToken = function(response) {
				var responseHeaders = response.$httpHeaders();
				if (responseHeaders.usertokenupdate) {
					console.log('updated user token',responseHeaders.usertokenupdate);
					$scope.user.model.token = responseHeaders.usertokenupdate;
					$rootScope.$broadcast('saveuser');
				}
			};

			$scope.appDiagData = {
				static: [],
				dynamic: []
			};

			$scope.$on('$viewContentLoaded', function() {
				console.log('Draw controller loaded');
			});
			$scope.$on('$destroy', function() {
				console.log('Draw controller destroyed');
			});
		}
	]);
