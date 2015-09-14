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
		currentEvent : '=',
		updateSwitch : '='

	};


	function linkFunction(scope, element, attrs) {

		localScope = scope;
		localScope.SelectEvent = selectEvent;

		scope.$watch('updateSwitch', function(newValue, oldValue, scope) {
			
			setEventsHeight();
		});

		setEventsHeight();
	}

	function setEventsHeight() {

		angular.forEach(localScope.events, function(value, key){
			
			value.top = getEventTop(value);
			value.bottom = getEventBottom(value);
			value.height = getEventHeight(value);

			if(value.top + value.bottom + value.height > 100) {

				throw 'incorrect dimensions for task meter';
			}
		});
	}

	function getEventHeight(_event) {

		var workDayInMinutes = 17 * 60,
			eventEndInMinutes = _event.end.hours() === 0 ? (24 * 60) : _event.end.hours() * 60 + _event.end.minutes(),
			eventStartInMinutes = _event.start.hours() * 60 + _event.start.minutes(),
			eventDurationInMinutes = eventEndInMinutes - eventStartInMinutes,
			maxHeight = 100,
			eventHeightAsPercentage = eventDurationInMinutes / workDayInMinutes * maxHeight;

		return Math.floor(eventHeightAsPercentage);
	}

	function getEventTop(_event) {

		var workDayInMinutes = 17 * 60,
			maxHeight = 100,
			startOfDayInMinutes = 7 * 60,
			eventStartInMinutes = _event.start.hours() * 60 + _event.start.minutes(),
			minutesFromStartOfDay = eventStartInMinutes - startOfDayInMinutes,
			top = minutesFromStartOfDay / workDayInMinutes * maxHeight;

		return Math.floor(top);
	}

	function getEventBottom(_event) {

		if(_event.end.hours() === 0) {

			return 0;
		}

		var workDayInMinutes = 17 * 60,
			maxHeight = 100,
			endOfDayInMinutes = 24 * 60,
			eventEndInMinutes = _event.end.hours() * 60 + _event.end.minutes(),
			minutesFromEndOfDay = endOfDayInMinutes - eventEndInMinutes,
			top = minutesFromEndOfDay / workDayInMinutes * maxHeight;

		return Math.floor(top);
	}


	function selectEvent(_event) {

		localScope.currentEvent = _event;
	}

}());