'use strict';

describe('appCore module', function() {

	beforeEach(module('appCore'));

	describe('Translate controller', function() {
		var scope, translate, ctrl;

		beforeEach(inject(function($rootScope, $controller, _$translate_) {
			scope = $rootScope.$new();
			translate = _$translate_;
			spyOn(translate, 'use').and.callThrough();
			ctrl = $controller('TranslateCtrl', {$scope: scope, $translate: translate});
		}));

		it('should be defined', function(){
			expect(ctrl).toBeDefined();
			console.log('translate: ', translate);
		});

		it('should have proper definitions', function() {
			expect(scope.changeLanguage).toBeDefined();
		});

		it('should call respective method on changeLanguage method call', function() {
			scope.changeLanguage('ru');
			expect(translate.use).toHaveBeenCalledWith('ru');
		});

	});
});
