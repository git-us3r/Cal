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

		events : '=',
		currentEvent : '='
	};


	function linkFunction(scope, element, attrs) {

		localScope = scope;
		localScope.SelectEvent = selectEvent;
	}

	function selectEvent(eventId) {

		for(var i = 0; i < localScope.events.length; ++i) {

			if(localScope.events[i].id === eventId) {

				localScope.currentEvent = localScope.events[i];
				return;
			}
		}
	}

}());