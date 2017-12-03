'use strict';

angular.module('appCore.userPanel', [])

	.controller('UserPanelController', ['$rootScope', '$state', '$scope', '$filter', 'UserService', 'usSpinnerService', 'API',

		function($rootScope, $state, $scope, $filter, UserService, usSpinnerService, API) {
			$scope.displayError = undefined;
			$scope.loading = true;
			$scope.$watch('loading',function(newValue) {
				if (newValue) { usSpinnerService.spin('root-spinner'); }
				if (!newValue) { usSpinnerService.stop('root-spinner'); }
			});
			$scope.displayModal = false;
			$rootScope.$on('displayModal', function(event) {
				console.log('displayModal catched', event);
				$scope.displayModal = ($scope.displayModal) ? false : true;
			});

			$scope.user = UserService;
			$scope.updateUserToken = function(response) {
				var responseHeaders = response.$httpHeaders();
				if (responseHeaders.usertokenupdate) {
					console.log('updated user token',responseHeaders.usertokenupdate);
					$scope.user.model.token = responseHeaders.usertokenupdate;
					$rootScope.$broadcast('saveuser');
				}
			};

			/*
			*	UI filters
			*/
			$scope.filters = {
				dateRangeStart: undefined,
				dateRangeEnd: new Date().toISOString(),
				filterById: undefined,
				filterByDate: undefined,
				filterByParticipation: undefined,
				filterByFullName: undefined,
				filterByEmail: undefined,
				filterByPhone: undefined,
				filterByControlAmount: undefined,
				filterByControlVendorId: undefined,
				filterByControlMessage: undefined
			};
			$scope.$watch('filters.dateRangeStart', function(newValue){
				if (typeof newValue !== 'undefined'){
					$scope.filters.filterByDate = $filter('convertDate')(newValue,'yyyy-mm-dd');
				}
			});
			/*
			*	DateTimePicker config
			*/
			$scope.dateTimePickerConfig = {
				dropdownSelector: '#dropdown1',
				minView: 'day'
			};
			$scope.beforeRenderStartDate = function($view, $dates, $leftDate, $upDate, $rightDate) {
				console.log('beforeRenderStartDate: ', $view, $dates, $rightDate, $upDate, $leftDate);
				if ($scope.filters.dateRangeEnd) {
					var activeDate = moment($scope.filters.dateRangeEnd);
					for (var i = 0; i < $dates.length; i++) {
						if ($dates[i].localDateValue() > activeDate.valueOf()) { $dates[i].selectable = false; }
					}
				}
			};

			/*
			* PAGER
			*
			* paging functions are defined in directive
			* on button click directive calls $scope.pagerCallback method
			* which wraps an actual controller method to update paged data
			*/
			$scope.urlParams = {
				page: 0,
				size: 10
			};
			$scope.total = {
				pages: 0,
				elements: 0
			};
			$scope.pages = [];
			$scope.pagerCallback = function() {
				$scope.updateEntrantsModel();
			};
			$scope.$watch('total.pages',function(newValue) {
				if (newValue > 0){
					$scope.pages = [];
					for (var i=0; i<$scope.total.pages; i++){
						console.log(i);
						$scope.pages.push(i);
					}
					console.log('pages',$scope.pages);
				}
			});

			$scope.entrants = [];
			$scope.query = {
				entrants: {
					limit: 0,
					offset: 0,
					user_token: $scope.user.model.token
				}
			};
			$scope.updateEntrantsModel = function() {
				console.log('updating entrants model');
				$scope.loading = true;
				$scope.query.entrants.limit = $scope.urlParams.size;
				$scope.query.entrants.offset = $scope.urlParams.size * $scope.urlParams.page;
				API.EntrantsService().query($scope.query.entrants).$promise.then(
					function(response) {
						$scope.updateUserToken(response);
						if (!response.error){
							$scope.entrants = [];
							var responseData = response.data;
							for (var i=0; i<responseData.length; i++) {
								console.log(responseData[i]);
								responseData[i].created = $filter('convertDate')(responseData[i].created,'yyyy-mm-dd hh:mm:ss');
								$scope.entrants.push(responseData[i]);
							}
							$scope.total.pages = response.pages;
							$scope.total.elements = response.elements;
							$scope.displayError = undefined;
							console.log('EntrantsService, entrants model updated:',$scope.entrants);
						}else {
							console.log('EntrantsService, error: ', response.error);
							$scope.displayError = response.error;
						}
						$scope.loading = false;
					},
					function(error) {
						console.log('EntrantsService, error: ', error.error);
						$scope.displayError = error.error;
						$scope.loading = false;
					}
				);
			};
			$scope.$on('$viewContentLoaded', function(event) {
				console.log('User Panel Controller loaded:', event);
				$rootScope.$broadcast('restoreuser');
				if ($scope.user.model.role == 'user') {
					$scope.updateEntrantsModel();
				} else {
					$state.go('app.admin.dashboard');
				}
			});
			$scope.$on('$destroy', function(event) {
				console.log('User Panel Controller destroyed: ', event);
			});
		}
	]);
