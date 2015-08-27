// Requires app/js/CalendarSelectStrategy.js

var HandlerStrategyFactory = (function(){

	'use strict';
	
	var calendarSelectStrategy = Using.Require('CalendarSelectStrategy'),
		strategies = {

			CalendarSelectStrategy : 'CalendarSelectStrategy'
		};


	function create(Strategy, vm) {

		switch(Strategy) {

			case strategies.CalendarSelectStrategy:
				return calendarSelectStrategy.Create(vm);
			default:
				return null;
		}
	}


	var returnValue = {

		Create : create,
		Strategies : strategies
	};


	Using.Expose('HandlerStrategyFactory', returnValue);


}());