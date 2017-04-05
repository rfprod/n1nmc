'use strict';

describe('appCore.contentEditable module', function() {

	beforeEach(module('appCore.contentEditable'));

	describe('contentEditable directive', function() {
		var scope;

		beforeEach(inject(function($rootScope, $compile) {
			var elm = '<span id="test" contenteditable="false" ng-model="test"></span>'; // eslint-disable-line no-unused-vars
			scope = $rootScope.$new();
			elm = $compile(elm)(scope);
			scope.$digest();
		}));

		it('should have contenteditable set to false with no text inside', function() {
			expect($('#test').attr('contenteditable')).toBeFalsy();
			expect($('#test').text()).toEqual('');
		});
	});
});
