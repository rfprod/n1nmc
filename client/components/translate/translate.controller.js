'use strict';

angular.module('appCore')
	.controller('TranslateCtrl', ['$translate', '$scope', function translateCtrl($translate, $scope) {
		$scope.changeLanguage = function(langKey) {
			$translate.use(langKey);
		};
	}]);
