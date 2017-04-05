'use strict';

describe('appCore.filters filter: ', function () {

	beforeEach(module('appCore'));

	var filter;

	describe('findByCriteria', function () {

		beforeEach(inject(function($filter) {
			filter = $filter;
		}));

		it('must be defined', function () {
			expect(filter('findByCriteria')).toBeDefined();
		});

		it('must filter values and return either value or index', function () {
			var arr = [ {id:0,val:5}, {id:1,val:6}, {id:2,val:5}, {id:3,val:7} ];
			var predicate = function(item){
				return item.val === 6;
			};
			// returns object
			expect(filter('findByCriteria')(arr, predicate)).toEqual( {id:1,val:6} );
			// returns index
			expect(filter('findByCriteria')(arr, predicate, true)).toEqual(1);
		});

	});

	describe('convertDate', function () {

		beforeEach(inject(function($filter) {
			filter = $filter;
		}));

		it('must be defined', function () {
			expect(filter('convertDate')).toBeDefined();
		});

		it('must convert date to specified format from list: yyyy-mm-dd, yyyy-mm-dd hh:mm, yyyy-mm-dd hh:mm:ss', function () {
			var timestamp =  new Date().getTime();
			var format = ['yyyy-mm-dd', 'yyyy-mm-dd hh:mm', 'yyyy-mm-dd hh:mm:ss'];
			expect(filter('convertDate')(timestamp, format[0])).toMatch(/[0-9]{4}-[0-9]{2}-[0-9]{2}/);
			expect(filter('convertDate')(timestamp, format[1])).toMatch(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/);
			expect(filter('convertDate')(timestamp, format[2])).toMatch(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/);
		});

	});

});
