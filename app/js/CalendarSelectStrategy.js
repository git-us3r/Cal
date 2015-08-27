var CalendarSelectStrategy = (function() {

	'use strict';

	var vm = null;

	function create(_vm) {

		vm = _vm;
		return { ProcessEvent : processEvent };
	}


	function processEvent(start, end, jsEvent, view) {

		var multiday = eventIsMultiDay(start, end),
			dayHasEvents = thisDayHasEvents(start.date()),
			viewIsMonth = currentViewIsMonth(view),
			allDayEvent = eventIsAllDay(start, end);

		if(multiday) {

			vm.AddMultiDayEvent(start, end);
		}
		else if(dayHasEvents && viewIsMonth) {

			vm.GotoCalendarDayView(start);
		}
		else if(allDayEvent) {

			vm.AddAllDayEvent('Available', start, end);
		}
		else {

			vm.AddEvent('Available', start, end);
		}

		vm.Update();
	}



	function eventIsMultiDay(start, end) {

		if(end.date() - start.date() > 1) {

			return true;
		}
		else {

			return false;
		}
	}



	function thisDayHasEvents(day) {

		for(var i =0; i < vm.Events[0].length; ++i) {

			var evnt = vm.Events[0][i];

			if(evnt.start.date() === day || evnt.end.date() === day) {

				return true;
			}
		}

		return false;
	}



	function currentViewIsMonth(view) {

		if(view.intervalUnit === 'month') {

			return true;
		}

		return false;
	}



	function eventIsAllDay(start, end) {

		var diff = end.diff(start, 'hours');
		return diff === 24;
	}


	// Return the public interface.
	return  {

		Create : create
	};

}());