(function(){

	'use strict';

	var events = [],
		calendar = null,
		defaultEventColor = '#337AB7',
		allDayEventColor = 'orange';

	function init(functions) {

		$('#theCalendar').fullCalendar({

			height : 450,
			editable: true,
			selectable : true,
			header : {

				left : 'month agendaDay',
				center : 'title',
				right : 'today prev,next'
			},
			eventColor : defaultEventColor,
			eventOverlap : false,
			displayEventEnd : true,
			defaultView : 'month',
			businessHours : true,
			lazyFetching : false,
			select : functions.select,				// vm.calendarSelectStrategy.ProcessEvent,
			eventResize : functions.eventResize, 	// eventResizeHandler,
			eventClick : functions.eventClick 		// eventClickHandler
		});

		calendar = $('#theCalendar').fullCalendar('getCalendar');
		calendar.addEventSource(events);
	}


	function getEvents() {

		return events;
	}


	function thisDayHasEvent(day) {

		for(var i =0; i < events.length; ++i) {

			var evnt = events[i];

			if(evnt.start.date() === day || evnt.end.date() === day) {

				return true;
			}
		}

		return false;
	}


	function addMultiDayEvent(start, end) {

		var startDay = start.date();
		var endDay = end.date();
		var daysInBetween = endDay - startDay;

		addAllDayEvent('Available', start, moment(start).add(1, 'days'));	

		for(var i = 1; i < daysInBetween; ++i) {

			addAllDayEvent('Available', moment(start).add(i, 'days'), moment(start).add(i + 1, 'days'));
		}
	}



	function addAllDayEvent(_title, _start, _end) {

		if(thisDayHasEvent(_start.date())) {

			return;
		}

		var year = _start.year();
		var month = _start.month();
		var day = _start.date();
		
		var newEventStart = calendar.moment({
			y : year,
			M : month,
			d : day,
			h : 9,
			m : 0,
			s : 0,
			ms : 0

		});

		var newEventEnd = calendar.moment({
			y : year,
			M : month,
			d : day,
			h : 18,
			m : 0,
			s : 0,
			ms : 0
		});
		
		var newEvent = {
			id : Date.now(),
			title : _title,
			start : newEventStart,
			end : newEventEnd,
			isAllDay : true,
			color : 'orange'
		};

		storeEvent(newEvent);
	}



	function addEvent(_title, _start, _end) {

		var newEvent = {

				id : Date.now(),
				title : _title,
				start : _start,
				end : _end
			};
		
		storeEvent(newEvent);
	}


	function storeEvent(newEvent) {

		events.push(newEvent);
		refreshCalendar();
	}


	function refreshCalendar() {

		calendar.removeEventSource(events);
		calendar.addEventSource(events);
	}


	function gotoCalendarDayView (start) {
			
		calendar.fullCalendar('changeView', 'agendaDay');
		calendar.fullCalendar('gotoDate', $('theCalendar').moment(start));
	}


	Using.Expose('EventManager', { 

		Init : init,
		GetEvents : getEvents,
		ThisDayHasEvent : thisDayHasEvent,
		AddEvent : addEvent,
		AddAllDayEvent : addAllDayEvent,
		AddMultiDayEvent : addMultiDayEvent,
		GotoCalendarDayView : gotoCalendarDayView,
	});

}());