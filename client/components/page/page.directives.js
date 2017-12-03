'use strict';

angular.module('appCore')

	.directive('pageTitle', ['$rootScope', function($rootScope) {
		return {
			templateUrl: 'views/common/pageTitle.html',
			link: function(scope) {
				scope.title = $rootScope.$state.current.data.pageTitle;
				scope.leadText = $rootScope.$state.current.data.pageLead;
				scope.showLevelUp = false;
				scope.levelUp = undefined;
				scope.listener = function(event, toState /*, toParams, fromState, fromParams*/) {
					var title = 'appTitle', lead;
					if (toState.data && toState.data.pageTitle) { title = toState.data.pageTitle; }
					if (toState.data && toState.data.pageLead) { lead = toState.data.pageLead; }
					scope.title = title;
					scope.leadText = lead;
					/*
					*	level up button (for views which are not listed in the main menu)
					*
					*	TODO - reconfig levelUp button visibility
					*/
					if (toState.name.indexOf('devices.access') !== -1) {
						scope.showLevelUp = true;
						scope.levelUp = 'user.devices.list';
					}else if (toState.name.indexOf('devices.tariffs') !== -1) {
						scope.showLevelUp = true;
						scope.levelUp = 'user.devices.list';
					}else if (toState.name.indexOf('devices.add') !== -1) {
						scope.showLevelUp = true;
						scope.levelUp = 'user.devices.list';
					}else if (toState.name.indexOf('devices.termination') !== -1) {
						scope.showLevelUp = true;
						scope.levelUp = 'user.devices.list';
					}else if (toState.name.indexOf('friends.invite') !== -1) {
						scope.showLevelUp = true;
						scope.levelUp = 'user.friends.list';
					}else if (toState.name.indexOf('balance.history') !== -1) {
						scope.showLevelUp = true;
						scope.levelUp = 'user.balance.info';
					}else{
						scope.showLevelUp = false;
						scope.levelUp = undefined;
					}
				};
				scope.listener({}, $rootScope.$state.current);
				$rootScope.$on('$stateChangeStart', scope.listener);
			}
		};
	}])

	.directive('notification', [function() {
		return {
			templateUrl: 'views/common/note.html',
			link: function(scope) {
				/*
				*   TODO
				*   set to false to enable the notification
				*/
				scope.dismissed = true;
				scope.dismissAlert = function(){
					scope.dismissed = true;
				};
				/*
				*   TODO
				*   static note text
				*/
				scope.noteText = 'You have an unhandled event:';
				/*
				*   TODO
				*   link to a respective state where event should be handled
				*/
				scope.uiSref = 'user.termination.list';
				/*
				*   TODO
				*   notification text
				*/
				scope.linkText = 'New termination request';
				/*
				*   TODO
				*   should query notifications endpoint
				*   notification visibility and contents should depend on the received data
				*/
			}
		};
	}])

	.directive('pager', [ function() {
		return {
			link: function(scope, element, attrs) {
				console.log('pager attrs',attrs);
				console.log('pager element',element);
				scope.selectPreviousPage = function() {
					console.log('previous pageSelected');
					if (scope.urlParams.page > 0) {
						scope.urlParams.page--;
						console.log('selected page',scope.urlParams.page);
						scope.pagerCallback();
					}
				};
				scope.selectPage = function(event) {
					console.log('pageSelected',event);
					if (scope.urlParams.page !== parseInt(event.target.id)){
						scope.urlParams.page = parseInt(event.target.id);
						console.log('selected page',scope.urlParams.page);
						scope.pagerCallback();
					}
				};
				scope.selectNextPage = function() {
					console.log('next pageSelected');
					if (scope.urlParams.page < scope.total.pages) {
						scope.urlParams.page++;
						console.log('selected page',scope.urlParams.page);
						scope.pagerCallback();
					}
				};
				scope.setSize = function(event) {
					console.log('setSize',event);
					if (event.target.innerText === '-') {
						scope.urlParams.size = 0;
						console.log('new size',scope.urlParams.size);
					} else if (scope.urlParams.size !== parseInt(event.target.innerText)) {
						scope.urlParams.size = parseInt(event.target.innerText);
						console.log('new size',scope.urlParams.size);
					}
					scope.pagerCallback();
				};
			}
		};
	}])

	.directive('toggleCheckbox', function() {
		return {
			restrict: 'A',
			transclude: true,
			replace: false,
			require: 'ngModel',
			link: function($scope, $element, $attr, require) {
				var ngModel = require;
				$scope.togglerState = undefined;

				// update model from Element
				$scope.updateModelFromElement = function() {
					// If modified
					var checked = $element.prop('checked');
					if (checked !== ngModel.$viewValue) {
						// Update ngModel
						ngModel.$setViewValue(checked);
						$scope.$apply();
					}
				};

				// Update input from Model
				$scope.updateElementFromModel = function() {
					// Update button state to match model
					$scope.togglerState = ! $($element).attr('disabled');
					$($element).bootstrapToggle('enable');
					$element.trigger('change');
					$($element).bootstrapToggle($scope.togglerState ? 'enable' : 'disable');
				};

				// Observe: Element changes affect Model
				$element.on('change', function() {
					$scope.updateModelFromElement();
				});

				// Observe: ngModel for changes
				$scope.$watch(function() {
					return ngModel.$viewValue;
				}, function() {
					$scope.updateElementFromModel();
				});

				// Observe: disabled attribute set by ngDisabled
				$scope.$watch(function() {
					return $($element).attr('disabled');
				}, function(newVal) {
					$($element).bootstrapToggle(! newVal ? 'enable' : 'disable');
				});

				// Initialise BootstrapToggle
				$element.bootstrapToggle();

			}
		};
	})

	.directive('currentYear', [function() {
		return {
			link: function(scope, element/*, attrs*/) {
				scope.currentYear = new Date().getFullYear();
				angular.element(element)[0].innerHTML = '&copy; '+scope.currentYear;
			}
		};
	}]);
