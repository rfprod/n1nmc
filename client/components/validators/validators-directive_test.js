'use strict';

describe('appCore validators directive: ', function () {

	beforeEach(module('appCore'));

	var scope, element, controller;

	describe('compareTo', function () {

		beforeEach(inject(function($rootScope, $compile) {
			scope = $rootScope.$new();
			spyOn(scope,'$watch').and.callThrough();
			element = $compile('<div compare-to ng-model="ngModel"></div>')(scope);
			controller = element.controller('ngModel');
		}));

		it('element must be defined', function () {
			expect(element).toBeDefined();
		});

		it('must watch otherModelValue changes and return true on respective controller method call if modelValue equals otherModelValue', function () {
			expect(scope.$watch).toHaveBeenCalled();
			expect(controller.$validators.compareTo()).toBeTruthy();
			expect(controller.$validators.compareTo('z')).toBeFalsy();
		});

	});

});
