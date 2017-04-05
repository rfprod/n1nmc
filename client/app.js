'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('appCore', [
	'angularSpinner',
	'ngAnimate',
	'ngAria',
	'ngCookies',
	'ngMessages',
	'ngResource',
	'ngSanitize',
	'ngTouch',
	'nvd3',
	'oc.lazyLoad',
	'pascalprecht.translate',
	'ui.router',
	'ui.bootstrap',
	'ui.bootstrap.datetimepicker',

	'appCore.nav',
	'appCore.signIn',
	'appCore.filters',
	'appCore.userPanel',
	'appCore.adminPanel',
	'appCore.modals',
	'appCore.profile',
	'appCore.analytics',
	'appCore.diag',
	'appCore.validators',
	'appCore.version',
	'appCore.contentEditable',
	'appCore.httpServices',
	'appCore.userService'
]).
config(['$stateProvider', '$urlRouterProvider', 'usSpinnerConfigProvider', function($stateProvider, $urlRouterProvider, usSpinnerConfigProvider) {

	$urlRouterProvider.otherwise('/app/sign-in');

	$stateProvider
		.state('app', {
			url: '/app',
			abstract: true,
			templateUrl: 'views/common/layout.html'
		})

		.state('app.sign-in', {
			url: '/sign-in',
			templateUrl: 'views/sign-in/sign-in.html',
			controller: 'SignInController',
			data: {
				requireAuth: false,
				pageTitle: 'Page.Title.Signin',
				pageLead: 'Page.Brief.Signin'
			}
		})

		.state('app.profile', {
			url: '/profile',
			templateUrl: 'views/profile/profile.html',
			controller: 'ProfileController',
			data: {
				requireAuth: true,
				pageTitle: 'Page.Title.Profile',
				pageLead: 'Page.Brief.Profile'
			}
		})

		.state('app.user', {
			url: '/user',
			abstract: true,
			template: '<ui-view/>'
		})
			.state('app.user.dashboard', {
				url: '/dashboard',
				data: {
					pageTitle: 'Page.Title.Dashboard',
					pageLead: 'Page.Brief.Dashboard'
				},
				views:{
					'':{
						templateUrl: 'views/user-panel/user-panel.html',
						controller: 'UserPanelController',
					},
					'analytics@app.user.dashboard':{
						templateUrl: 'views/analytics/analytics.html',
						controller: 'AnalyticsController'
					}
				},
				resolve: {
					loadPlugin: function($ocLazyLoad) {
						return $ocLazyLoad.load([
						]);
					}
				}
			})

		.state('app.admin', {
			url: '/admin',
			abstract: true,
			template: '<ui-view/>'
		})
			.state('app.admin.dashboard', {
				url: '/dashboard',
				data: {
					pageTitle: 'Page.Title.Dashboard',
					pageLead: 'Page.Brief.Dashboard'
				},
				views:{
					'':{
						templateUrl: 'views/admin-panel/admin-panel.html',
						controller: 'AdminPanelController',
					},
					'analytics@app.admin.dashboard':{
						templateUrl: 'views/analytics/analytics.html',
						controller: 'AnalyticsController'
					},
					'diag@app.admin.dashboard':{
						templateUrl: 'views/diag/diag.html',
						controller: 'DiagController'
					}
				},
				resolve: {
					loadPlugin: function($ocLazyLoad) {
						return $ocLazyLoad.load([
						]);
					}
				}
			})
	;

	usSpinnerConfigProvider.setDefaults({
		lines: 13, // The number of lines to draw
		length: 28, // The length of each line
		width: 14, // The line thickness
		radius: 42, // The radius of the inner circle
		scale: 1, // Scales overall size of the spinner
		corners: 1, // Corner roundness (0..1)
		color: '#fff', // #rgb or #rrggbb or array of colors
		opacity: 0.25, // Opacity of the lines
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		className: 'spinner', // The CSS class to assign to the spinner
		top: '50vh', // Top position relative to parent
		left: '50%', // Left position relative to parent
		shadow: true, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		position: 'fixed' // Element positioning
	});

}])
.run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth){
	$rootScope.$state = $state;
	$rootScope.$on('$stateChangeStart', function (event, toState) {
		if ( ( toState.data === undefined || toState.data.requireAuth === undefined || toState.data.requireAuth ) && !Auth.authenticated()) {
			event.preventDefault();
			$state.go('app.sign-in');
		}
	});
}]);
