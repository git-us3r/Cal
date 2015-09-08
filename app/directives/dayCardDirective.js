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
		ViewEvent : '&'
	};


	function linkFunction(scope, element, attrs) {

		localScope = scope;
		localScope.Events = scope.$parent.vm.DayEvents;
		localScope.ViewEvent = scope.$parent.vm.ViewEvent;
		localScope.SelectEvent = selectEvent;
	}

	function selectEvent(eventId) {

		for(var i = 0; i < localScope.Events.length; ++i) {

			if(localScope.Events[i].id === eventId) {

				localScope.ViewEvent(localScope.Events[i]);
			}
		}
	}

}());