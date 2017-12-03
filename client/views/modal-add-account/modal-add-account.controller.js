'use strict';

/* global angularModals */

angularModals

	.controller('ModalAddAccountController', ['$scope', '$uibModalInstance', 'userToken',

		function($scope, $uibModalInstance, userToken) {
			$scope.newAccount = {
				email: undefined,
				firstName: undefined,
				lastName: undefined,
				role: undefined,
				user_token: userToken
			};
			$scope.regex = {
				email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{1,}$/
			};
			$scope.roles = {
				admin: 'admin',
				user: 'user'
			};
			$scope.disableOkButton = function() {
				return (!$scope.newAccount.email || !$scope.newAccount.firstName || !$scope.newAccount.lastName || !$scope.newAccount.role);
			};
			$scope.ok = function() {
				$uibModalInstance.close($scope.newAccount);
			};
			$scope.cancel = function() {
				$uibModalInstance.dismiss('cancel');
			};

			$scope.$on('$viewContentLoaded', function() {
				console.log('add account modal controller loaded');
				/*
				* this is a modal, $viewContentLoaded is not fired
				*/
			});
			$scope.$on('$destroy', function() {
				console.log('add account modal controller destroyed');
			});
		}
	]);
