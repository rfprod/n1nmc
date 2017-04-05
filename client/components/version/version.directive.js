'use strict';

angular.module('appCore.version.app-version', [])

.directive('appVersion', ['version', function(version) {
	return function(scope, elm/*, attrs*/) {
		elm.text(version);
	};
}]);
