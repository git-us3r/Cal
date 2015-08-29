(function(){

	'use strict';

	var events = {},
		eventsArray = [],
		retrievableGarbage = [],
		calendar = null,
		listeners = {CalendarUpdate : []},
		currentEvent = null,
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
			eventResize : eventResize, 				// eventResizeHandler,
			eventClick : functions.eventClick 				// eventClickHandler
		});

		calendar = $('#theCalendar').fullCalendar('getCalendar');
		calendar.addEventSource(eventsArray);
	}


	function eventResize(_event, delta, revertFunc) {

		if(events.hasOwnProperty(_event.id)) {

			_event.color = defaultEventColor;
			events[_event.id] = _event;
		}

		refreshCalendar();
	}


	function getEvents() {

		updateEventsArray();

		return eventsArray;
	}


	function thisDayHasEvent(day) {

		for(var key in events) {

			if(events.hasOwnProperty(key)) {

				var evnt = events[key];

				if(evnt.start.date() === day || evnt.end.date() === day) {

					return true;
				}
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

		if(events.hasOwnProperty(newEvent.id)) {

			return; 	// event exists ?!
		}

		currentEvent = newEvent;
		events[newEvent.id] = newEvent;
		refreshCalendar();
	}


	function refreshCalendar() {

		calendar.removeEvents();
		calendar.removeEventSource(eventsArray);
		updateEventsArray();
		calendar.addEventSource(eventsArray);
		notifyListenersToCalendarUpdate();

	}


	function notifyListenersToCalendarUpdate() {

		for(var i = 0; i < listeners.CalendarUpdate.length; ++i) {

			listeners.CalendarUpdate[i](eventsArray, currentEvent);
		}
	}


	function updateEventsArray() {

		eventsArray = [];

		for(var key in events) {

			if(events.hasOwnProperty(key)) {

				eventsArray.push(events[key]);
			}
		}
	}


	function gotoCalendarDayView (start) {
			
		calendar.changeView('agendaDay');
		calendar.gotoDate(calendar.moment(start));
	}


	function getCurrentEvent() {

		return currentEvent;
	}


	function hasEvent(_event) {

		return events.hasOwnProperty(_event.id);
	}


	function setCurrentEvent(_event) {

		if(events.hasOwnProperty(_event.id)) {

			currentEvent = _event;
		}
	}


	function editEvent(_event) {

		if(events.hasOwnProperty(_event.id)) {

			currentEvent = _event;

			events[_event.id] = _event;
		}

		refreshCalendar();
	}


	function addListenerToCalendarUpdateEvent(listener) {

		listeners.CalendarUpdate.push(listener);
	}


	function removeEvent(_event) {

		if(events.hasOwnProperty(_event.id)) {
			delete events[_event.id];

			refreshCalendar();
		}
	}


	function addTimeToEvent(_event, timeSection, time, timeUnit) {

		if(events.hasOwnProperty(_event.id)) {

			if(timeSection === 'start') {

				_event.start = _event.start.add(time, timeUnit);
			}
			else {

				_event.end = _event.end.add(time, timeUnit);
			}

			_event.color = defaultEventColor;

			editEvent(_event);
		}
	}


	function getEventPercentageValue(_event) {

		var workdayInMinutes = 9 * 60,
			eventDurationInMinutes = getEventDurationInMinutes(_event),
			eventDurationPercentage = eventDurationInMinutes / workdayInMinutes * 100; 		// 8-hour day

		return  eventDurationPercentage;
	}



	function getEventDurationInMinutes(_event) {

		var startTimeInMinutesFromZero = _event.start.hour() * 60 + _event.start.minute(),
			endTimeInMinutesFromZero = _event.end.hour() * 60 + _event.end.minute(),
			differenceInMinutes = endTimeInMinutesFromZero - startTimeInMinutesFromZero;	// greater than 0

		return differenceInMinutes;
	}
 

	Using.Expose('EventManager', { 

		Init : init,
		GetEvents : getEvents,
		ThisDayHasEvent : thisDayHasEvent,
		AddEvent : addEvent,
		AddAllDayEvent : addAllDayEvent,
		AddMultiDayEvent : addMultiDayEvent,
		GotoCalendarDayView : gotoCalendarDayView,
		GetCurrentEvent : getCurrentEvent,
		HasEvent : hasEvent,
		SetCurrentEvent : setCurrentEvent,
		DefaultEventColor : defaultEventColor,
		AllDayEventColor : allDayEventColor,
		EditEvent : editEvent,
		AddListenerToCalendarUpdateEvent : addListenerToCalendarUpdateEvent,
		RemoveEvent : removeEvent,
		AddTimeToEvent : addTimeToEvent,
		GetEventPercentageValue: getEventPercentageValue,
		GetEventDurationInMinutes: getEventDurationInMinutes

	});

}());