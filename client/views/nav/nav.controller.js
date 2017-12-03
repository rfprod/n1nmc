'use strict';

angular.module('appCore.nav', [])

	.controller('NavigationController', ['$rootScope', '$scope', '$state', 'UserService', 'API',
		function($rootScope, $scope, $state, UserService, API) {
			$scope.user = UserService;
			$scope.isAdmin = function() {
				if ($scope.user) {
					if ($scope.user.model.role === 'admin') return true;
				}
				return false;
			};
			$scope.showNavigation = function() {
				console.log('$state.current.name', $state.current.name);
				return (
					$state.current.name !== 'app.register' &&
					$state.current.name !== 'app.restore' &&
					$state.current.name !== 'app.sign-in' &&
					$state.current.name !== ''
				);
			};

			$scope.navToggler = undefined;
			$scope.collapseNavbar = false;
			$scope.toggleNavbarCollapse = function() {
				$scope.navToggler = angular.element('.navbar-toggle');
				if ($scope.navToggler.css('display') !== 'none') {
					$scope.collapseNavbar = ($scope.collapseNavbar) ? false : true;
				} else {
					$scope.collapseNavbar = false;
				}
			};

			$scope.logout = function () {
				API.LogOutService().query({user_token: $scope.user.model.token}).$promise.then(function(response) {
					console.log('Log Out Service, response:', response);
					$rootScope.$broadcast('resetuser');
					$scope.toggleNavbarCollapse();
					$state.go('app.sign-in');
				});
			};
		}
	]);
