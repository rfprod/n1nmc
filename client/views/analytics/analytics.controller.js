'use strict';

angular.module('appCore.analytics', [])

	.controller('AnalyticsController', ['$rootScope', '$scope', '$filter', 'UserService', 'usSpinnerService', 'API',

		function($rootScope, $scope, $filter, UserService, usSpinnerService, API) {
			$scope.displayError = undefined;
			$scope.displayModal = false;
			$scope.toggleModal = function() {
				$scope.displayModal = ($scope.displayModal) ? false : true;
				if ($scope.displayModal) $scope.updateAnalyticDataModel();
				$rootScope.$broadcast('displayModal');
			};

			$scope.loading = false;
			$scope.$watch('loading', function(newValue) {
				if (newValue) { usSpinnerService.spin('root-spinner'); }
				if (!newValue) { usSpinnerService.stop('root-spinner'); }
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

			$scope.reportSuccessfullySent = false;
			$scope.getReport = function() {
				console.log('get entrats report by email');
				$scope.loading = true;
				API.GetReportService().save({ email: $scope.user.model.email, user_token: $scope.user.model.token}).$promise.then(
					function(response) {
						$scope.updateUserToken(response);
						if (!response.error){
							console.log('GetReportService, response:', response);
							$scope.reportSuccessfullySent = true;
							$scope.displayError = undefined;
						} else {
							console.log('GetReportService, error: ', response.error);
							$scope.displayError = response.error;
						}
						$scope.loading = false;
					},
					function(error) {
						console.log('GetReportService, error: ', error.error);
						$scope.displayError = error.error;
						$scope.loading = false;
					}
				);
			};

			$scope.options_1 = {
				chart: {
					type: 'stackedAreaChart',
					height: 450,
					margin : {
						top: 20,
						right: 20,
						bottom: 40,
						left: 55
					},
					x: function(d) { return d.date; },
					y: function(d) { return d.value; },
					useInteractiveGuideline: true,
					useVoronoi: false,
					clipEdge: true,
					duration: 100,
					dispatch: {
						stateChange: function(e) { console.log('stateChange: ', e); },
						changeState: function(e) { console.log('changeState: ', e); },
						tooltipShow: function(e) { console.log('tooltipShow: ', e); },
						tooltipHide: function(e) { console.log('tooltipHide: ', e); },
						renderEnd: function(e) { console.log('renderEnd: ', e); }
					},
					xAxis: {
						axisLabel: 'Registration Date',
						showMaxMin: false,
						tickFormat: function(x) { return d3.time.format('%x')(new Date(x)); }
					},
					yAxis: {
						axisLabel: 'Entrants Quantity',
						tickFormat: function(y) { return d3.format(',.0f')(y); },
						axisLabelDistance: -10
					},
					callback: function(chart) {
						console.log('stackedAreaChart callback: ', chart);
					}
				},
				title: {
					enable: true,
					text: 'Entrants'
				},
				subtitle: {
					enable: true,
					text: 'differentiated by participation status',
					css: {
						'text-align': 'center',
						'margin': '10px 13px 0px 7px'
					}
				},
				caption: {
					enable: true,
					html: '<b>Chart 1.</b> Quantity of entrants differentiated by current participation status.',
					css: {
						'text-align': 'justify',
						'margin': '10px 13px 0px 7px'
					}
				}
			};
			$scope.data_1 = [
				{
					key: 'Participating',
					values: [
						{ 'date' : new Date().getTime(), 'value' : 0 },
						{ 'date' : new Date().getTime()+1000, 'value' : 1 },
						{ 'date' : new Date().getTime()+2000, 'value' : 32 },
						{ 'date' : new Date().getTime()+3000, 'value' : 196 },
						{ 'date' : new Date().getTime()+4000, 'value' : 110 },
						{ 'date' : new Date().getTime()+5000, 'value' : 154 },
						{ 'date' : new Date().getTime()+6000, 'value' : 202 },
						{ 'date' : new Date().getTime()+7000, 'value' : 278 }
					]
				},
				{
					key: 'Not Participating',
					values: [
						{ 'date' : new Date().getTime(), 'value' : 0 },
						{ 'date' : new Date().getTime()+1000, 'value' : 0 },
						{ 'date' : new Date().getTime()+2000, 'value' : 1 },
						{ 'date' : new Date().getTime()+3000, 'value' : 1 },
						{ 'date' : new Date().getTime()+4000, 'value' : 2 },
						{ 'date' : new Date().getTime()+5000, 'value' : 3 },
						{ 'date' : new Date().getTime()+6000, 'value' : 4 },
						{ 'date' : new Date().getTime()+7000, 'value' : 4 }
					]
				}
			];

			$scope.options_2 = {
				chart: {
					type: 'discreteBarChart',
					height: 450,
					margin : {
						top: 20,
						right: 20,
						bottom: 40,
						left: 55
					},
					x: function(d) { return d.label; },
					y: function(d) { return d.value; },
					duration: 100,
					showValues: true,
					staggerLabels: true,
					dispatch: {
						stateChange: function(e) { console.log('stateChange: ', e); },
						changeState: function(e) { console.log('changeState: ', e); },
						tooltipShow: function(e) { console.log('tooltipShow: ', e); },
						tooltipHide: function(e) { console.log('tooltipHide: ', e); },
						renderEnd: function(e) { console.log('renderEnd: ', e); }
					},
					yAxis: {
						axisLabel: 'Entrants Quantity',
						tickFormat: function(y) { return d3.format(',.0f')(y); },
						axisLabelDistance: -10
					},
					callback: function(chart) {
						console.log('discreteBarChart callback: ', chart);
					}
				},
				title: {
					enable: true,
					text: 'Entrants'
				},
				subtitle: {
					enable: true,
					text: 'differentiated by Vendor ID',
					css: {
						'text-align': 'center',
						'margin': '10px 13px 0px 7px'
					}
				},
				caption: {
					enable: true,
					html: '<b>Chart 2.</b> Quantity of entrants differentiated by Vendor ID.',
					css: {
						'text-align': 'justify',
						'margin': '10px 13px 0px 7px'
					}
				}
			};
			$scope.data_2 = [
				{
					key: 'Entrants By Vendor ID',
					values: [
						{
							'label' : 'vid1' ,
							'value' : -29.765957771107
						},
						{
							'label' : 'vid2' , 
							'value' : 0
						},
						{
							'label' : 'vid3' , 
							'value' : 32.807804682612
						},
						{
							'label' : 'vid4' , 
							'value' : 196.45946739256
						},
						{
							'label' : 'vid5' ,
							'value' : 0.19434030906893
						},
						{
							'label' : 'vid6' , 
							'value' : -98.079782601442
						}
					]
				}
			];

			$scope.analyticData = {
				entrants: []
			};
			$scope.updateAnalyticDataModel = function() {
				console.log('updating entrants model');
				$scope.loading = true;
				API.AnalyticDataService().query({ user_token: $scope.user.model.token}).$promise.then(
					function(response) {
						$scope.updateUserToken(response);
						if (!response.error){
							console.log('AnalyticDataService, response:', response);
							$scope.analyticData.entrants = [];
							var entrantsData = response.entrants;
							for (var i=0; i<entrantsData.length; i++) {
								entrantsData[i].created = $filter('convertDate')(entrantsData[i].created,'yyyy-mm-dd');
								$scope.analyticData.entrants.push(entrantsData[i]);
							}
							$scope.displayError = undefined;
							console.log('analyticData.entrants model updated:', $scope.analyticData.entrants);
							$scope.parseAnalyticData();
						} else {
							console.log('AnalyticDataService, error: ', response.error);
							$scope.displayError = response.error;
						}
						$scope.loading = false;
					},
					function(error) {
						console.log('AnalyticDataService, error: ', error.error);
						$scope.displayError = error.error;
						$scope.loading = false;
					}
				);
			};
			$scope.parseAnalyticData = function() {
				var startDate = new Date().getTime();
				startDate = $filter('convertDate')(startDate,'yyyy-mm-dd');
				var uniqueDates = [];
				$scope.data_2[0].values.length = 0;
				console.log('$scope.analyticData.entrants: ', $scope.analyticData.entrants);
				$scope.analyticData.entrants.forEach(function(item) {
					startDate = (new Date(startDate) < new Date(item.created)) ? startDate : item.created;
					if (uniqueDates.indexOf(item.created) === -1) uniqueDates.push(item.created);

					var index = $filter('findByCriteria')($scope.data_2[0].values, function(unit) {
						return unit.label === item.vendorId;
					}, true);
					console.log('index: ', index);
					if (index) {
						$scope.data_2[0].values[index].value++;
					} else {
						$scope.data_2[0].values.push({ label: item.vendorId, value: 1 });
					}
				});
				console.log('$scope.data_2[0]: ', $scope.data_2[0]);
				console.log('startDate:', startDate);
				console.log('uniqueDates:', uniqueDates);
				$scope.data_1[0].values.length = 0;
				$scope.data_1[1].values.length = 0;
				uniqueDates.forEach(function(item, index) {
					console.log('unique date:', item);
					$scope.data_1[0].values.push({ date: item, value: 0 });
					$scope.data_1[1].values.push({ date: item, value: 0 });
					$scope.analyticData.entrants.forEach(function(entrant, entrantIndex, entrantArray) {
						if (item === entrant.created) {
							if (entrant.participates) {
								console.log('entrant participates:', entrant.created);
								$scope.data_1[0].values[index].value++;
							} else {
								console.log('entrant does not participate:', entrant.created);
								$scope.data_1[1].values[index].value++;
							}
						}
						if (entrantIndex === entrantArray.length-1 && index > 0) {
							$scope.data_1[0].values[index].value += $scope.data_1[0].values[index-1].value;
							$scope.data_1[1].values[index].value += $scope.data_1[1].values[index-1].value;
						}
					});
				});
				$scope.data_1[0].values.forEach(function(item, index) {
					item.date = new Date(item.date).getTime();
					$scope.data_1[1].values[index].date = new Date(item.date).getTime();
				});
				console.log('data_1 parsed:', $scope.data_1);
			};

			$scope.$on('$viewContentLoaded', function() {
				console.log('Analytics controller loaded');
			});
			$scope.$on('$destroy', function() {
				console.log('Analytics controller destroyed');
			});
		}
	]);
