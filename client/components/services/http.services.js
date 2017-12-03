'use strict';

var httpServices = angular.module('appCore.httpServices', ['ngResource', 'ngWebSocket']);

/*
*	dynamically set backend base url to be able to deploy on any domain
*/
function setBaseUrl(absUrl) {
	//console.log('absUrl:', absUrl);
	//console.log(' >> set base URL. match', absUrl.match(new RegExp('http(s)?:\/\/[^/]+'), 'ig'));
	return absUrl.match(new RegExp('http(s)?://[^/]+'))[0];
}
function setBaseWs(absUrl) {
	//console.log(' >>> setBaseWs:', absUrl);
	var match = absUrl.match(new RegExp('://[^/]+'))[0];
	//console.log('match:', match);
	return (absUrl.length > 4 && match) ? 'ws' + match : '';
}

httpServices.service('API', ['$resource', '$location', '$websocket', function($resource, $location, $websocket) {
	var baseUrl = setBaseUrl($location.$$absUrl);
	console.log('baseUrl:', baseUrl);
	var baseUrlWS = setBaseWs($location.$$absUrl);
	/*
	*	TODO replace 'ecapseman' with word which can be used to identify app deployment domain
	*/
	baseUrlWS = (baseUrlWS.indexOf('ecapseman') === -1) ? baseUrlWS : (baseUrlWS.indexOf('wss') === -1) ? baseUrlWS + ':8000' : baseUrlWS + ':8443' ; // OpenShift specific - ws requests should be made to port :8080
	console.log('baseUrlWS', baseUrlWS);

	this.getAppDiagStaticData = function() {
		return $resource(baseUrl + '/app-diag/static', {}, {
			query: {method: 'GET', params: {}, isArray: true,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	},

	this.getAppDiagDynamicData = function() {
		var dataStream = $websocket(baseUrlWS + '/app-diag/dynamic'),
			response = [],
			scope = null;

		dataStream.onOpen(function(event) {
			console.log('ws connection opened', event);
		});

		dataStream.onMessage(function(message) {
			//console.log('incoming ws message:',message);
			scope = angular.element($('#diag')).scope();
			scope.$apply(function () {
				scope.appDiagData.dynamic = [];
			});
			response = [];
			var data = JSON.parse(message.data);
			data.forEach(function(item) {
				scope.$apply(function () {
					scope.appDiagData.dynamic.push(item);
				});
				response.push(item);
			});
		});

		dataStream.onError(function(event) {
			console.log('ws connection error', event);
			dataStream.close();
		});

		dataStream.onClose(function(event) {
			console.log('ws connection closed', event);
		});

		var obj = {
			arr: response,
			status: function() {
				return dataStream.readyState;
			},
			get: function() {
				dataStream.send(JSON.stringify({ action: 'get'}));
			},
			pause: function() {
				dataStream.send(JSON.stringify({ action: 'pause'}));
			},
			close: function() {
				dataStream.close();
			}
		};
		return obj;
	},

	this.AuthService = function() {
		return $resource(baseUrl + '/login', {}, {
			query: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.LogOutService = function() {
		return $resource(baseUrl + '/logout', {}, {
			query: {method: 'GET', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.GetMeService = function() {
		return $resource(baseUrl + '/api/users/me', {}, {
			query: {method: 'GET', params: {}, isArray: true,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.UpdateSelfService = function() {
		return $resource(baseUrl + '/api/users/me/update', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.ChangeSelfPasswordService = function() {
		return $resource(baseUrl + '/api/users/me/changepass', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.UserAccountsService = function() {
		return $resource(baseUrl + '/api/users/list', {}, {
			query: {method: 'GET', params: {}, isArray: true,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.NewUserService = function() {
		return $resource(baseUrl + '/api/users/new', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.EditUserService = function() {
		return $resource(baseUrl + '/api/users/update', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.ResetUserPasswordService = function() {
		return $resource(baseUrl + '/api/users/resetpass', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.DeleteUserService = function() {
		return $resource(baseUrl + '/api/users/remove', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.EntrantsService = function() {
		return $resource(baseUrl+'/api/entrants/list', {}, {
			query: {method: 'GET', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.NewEntrantService = function() {
		return $resource(baseUrl+'/entrants/new', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.SwitchEntrantService = function() {
		return $resource(baseUrl + '/api/entrants/switch', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.DeleteEntrantService = function() {
		return $resource(baseUrl+'/api/entrants/remove', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.AnalyticDataService = function() {
		return $resource(baseUrl+'/api/analytics/data', {}, {
			query: {method: 'GET', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};
	this.GetReportService = function() {
		return $resource(baseUrl+'/api/analytics/getreport', {}, {
			save: {method: 'POST', params: {}, isArray: false,
				interceptor: {
					response: function(response) {
						response.resource.$httpHeaders = response.headers;
						return response.resource;
					}
				}
			}
		});
	};

}]);
