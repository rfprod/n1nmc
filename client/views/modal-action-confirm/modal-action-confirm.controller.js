'use strict';

/* global angularModals */

angularModals

	.controller('ModalActionConfirm', ['$scope', '$uibModalInstance', 'modalData',

		function($scope, $uibModalInstance, modalData) {
			$scope.modalData = {
				title: modalData.title || 'modal title',
				text: modalData.text || 'modal text',
				ok: modalData.ok || 'ok button text',
				cancel: modalData.cancel || 'cancel button text'
			};
			$scope.ok = function() {
				$uibModalInstance.close();
			};
			$scope.cancel = function() {
				$uibModalInstance.dismiss('cancel');
			};

			$scope.$on('$viewContentLoaded', function() {
				console.log('action confirm modal controller loaded');
				/*
				* this is a modal, $viewContentLoaded is not fired
				*/
			});
			$scope.$on('$destroy', function() {
				console.log('action confirm modal controller destroyed');
			});
		}
	]);
