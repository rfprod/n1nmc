'use strict';

angular.module('appCore.contentEditable', [])

	.directive('contenteditable', function() {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elm, attrs, ngModel) {
				function read() {
					var text = elm[0].innerText;
					if( attrs.stripBr && text == '<br>' ) text = '';
					ngModel.$setViewValue(text);
				}

				ngModel.$render = function() {
					var val = ngModel.$viewValue;
					elm.html((val == 0) ? val : val || '');
				};

				elm.bind('blur keyup change', function() {
					scope.$apply(read);
				});
			}
		};
	});
