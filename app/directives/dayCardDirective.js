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

	var localScope = {

		Events : '=',
		ViewEvents : '&'
	};


	function linkFunction(scope, element, attrs) {

		localScope = scope;
		localScope.Events = scope.$parent.vm.DayEvents;
	}

}());