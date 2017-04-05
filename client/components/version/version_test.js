'use strict';

describe('appCore.version module', function() {
	beforeEach(module('appCore.version'));

	describe('version service', function() {
		it('should return current version', inject(function(version) {
			expect(version).toEqual('0.1');
		}));
	});
});
