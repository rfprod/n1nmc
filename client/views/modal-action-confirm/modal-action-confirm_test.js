'use strict';

describe('appCore.modals module', function() {

	beforeEach(module('appCore'));

	describe('Modal Action Confirm controller', function() {
		var scope, ctrl, data, uibModalInstance;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			uibModalInstance = jasmine.createSpyObj('uibModalInstance', ['close','dismiss','result.then']);
			data = {};
			ctrl = $controller('ModalActionConfirm', {$scope: scope, $uibModalInstance: uibModalInstance, modalData: data});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
		});

		it('should have proper definitions', function(){
			expect(scope.modalData).toEqual(jasmine.objectContaining({
				title: 'modal title',
				text: 'modal text',
				ok: 'ok button text',
				cancel: 'cancel button text'
			}));
			expect(scope.ok).toBeDefined();
			expect(scope.cancel).toBeDefined();
		});

	});
});
