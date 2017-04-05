'use strict';

angular.module('appCore.filters', [])

.filter('convertDate', function() {
	return function(inputDate, format) {
		var err; // eslint-disable-line no-unused-vars
		if (inputDate && (format === 'yyyy-mm-dd' || format === 'yyyy-mm-dd hh:mm' || format === 'yyyy-mm-dd hh:mm:ss')){
			var dateObj = new Date(inputDate);
			var month = (dateObj.getMonth() + 1).toString();
			var date = dateObj.getDate().toString();
			var hours = dateObj.getHours().toString();
			var minutes = dateObj.getMinutes().toString();
			var seconds = dateObj.getSeconds().toString();
			month = (month.length === 1) ? '0'+month : month;
			date = (date.length === 1) ? '0'+date : date;
			hours = (hours.length === 1) ? '0'+hours : hours;
			minutes = (minutes.length === 1) ? '0'+minutes : minutes;
			seconds = (seconds.length === 1) ? '0'+seconds : seconds;
			var formattedDate;
			if (format === 'yyyy-mm-dd hh:mm:ss') {
				formattedDate = dateObj.getFullYear()+'-'+month+'-'+date+' '+hours+':'+minutes+':'+seconds;
			} else if (format === 'yyyy-mm-dd hh:mm') {
				formattedDate = dateObj.getFullYear()+'-'+month+'-'+date+' '+hours+':'+minutes;
			} else if (format === 'yyyy-mm-dd') {
				formattedDate = dateObj.getFullYear()+'-'+month+'-'+date;
			}
			return formattedDate;
		} else {
			if (!inputDate && !format) { err = new TypeError('convertDate filter error: no date was provided, no format was provided'); }
			else if (!inputDate && format) { err = new TypeError('convertDate filter error: no date was provided'); }
			else if (inputDate && !format) { err = new TypeError('convertDate filter error: no format was provided'); }
		}
		return undefined;
	};
})

.filter('findByCriteria', function() {
	return function(array, predicate, returnIndex) {
		var err; // eslint-disable-line no-unused-vars
		if (array === null) {
			err = new TypeError('findByCriteria filter is called on null or undefined array');
			console.log(err.stack);
			throw err;
		}
		if (typeof predicate !== 'function') {
			err = new TypeError('predicate must be a function');
			console.log(err.stack);
			throw err;
		}
		var list = Object(array);
		var length = (list.length > 0) ? list.length : 0;
		var thisArg = arguments[1];
		var value;
		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return (!returnIndex ? value : i);
			}
		}
		return undefined;
	};
});
