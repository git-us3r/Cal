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

		setEventsHeight();
	}

	function setEventsHeight() {

		angular.forEach(localScope.events, function(value, key){
			
			value.height = getEventHeightAsPercentage(value);
		});
	}

	function getEventHeightAsPercentage(_event) {

		var workDayInMinutes = 17 * 60,
			eventEndInMinutes = _event.end.hours() === 0 ? 24 : _event.end.hours() * 60 + _event.end.minutes(),
			eventStartInMinutes = _event.start.hours() * 60 + _event.start.minutes(),
			eventDurationInMinutes = eventEndInMinutes - eventStartInMinutes,
			eventHeightAsPercentage = eventDurationInMinutes * 100 / workDayInMinutes;

		return Math.floor(eventHeightAsPercentage);
	}


	function selectEvent(_event) {

		localScope.currentEvent = _event;
	}

}());