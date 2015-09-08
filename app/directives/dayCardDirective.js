(function(){

	'use strict';

	angular.module('Calendar')
	.directive('dayCardDirective', ['$swipe', directiveFunction]);

	function directiveFunction($swipe){


		// TODO

		return {

			restrict : 'E',
			templateUrl : 'app/views/dayCardDirective.html',
			link : linkFunction,
			scope : localScope
		};
	}

	//////////////////////////////////////////

	var localScope;


	function linkFunction(scope, element, attrs) {

		// TODO
	}

}());