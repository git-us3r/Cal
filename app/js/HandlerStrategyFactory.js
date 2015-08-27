// Requires app/js/CalendarSelectStrategy.js

var HandlerStrategyFactory = (function(){

	'use strict';
	
	var strategies = {

		CalendarSelectStrategy : 'CalendarSelectStrategy'
	};


	function create(Strategy, vm) {

		switch(Strategy) {

			case strategies.CalendarSelectStrategy:
				return CalendarSelectStrategy.Create(vm);
			default:
				return null;
		}
	}


	return {

		Create : create,
		Strategies : strategies
	};
}());