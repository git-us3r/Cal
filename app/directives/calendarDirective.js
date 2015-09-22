(function(){

	'use strict';

	angular.module('Calendar')
	.directive('calendarDirective', ['$swipe', directiveFunction]);

	var localScope = {},
		events = {},
		eventsArray = [],
		retrievableGarbage = [],
		calendar = null,
		listeners = {CalendarUpdate : []},
		currentEvent = null,
		defaultEventColor = '#337AB7',
		allDayEventColor = 'orange';


	function directiveFunction($swipe){

		return {

			restrict : 'E',
			templateUrl : 'app/views/calendarDirective.html',
			link : linkFunction,
			scope : localScope
		};
	}


	function linkFunction(scope, element, attrs) {

		init();

	}


	function init(functions) {

		$(document).ready(function() {

            // page is now ready, initialize the calendar...

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
				slotDuration : '01:00:00',
				select : calendarSelect,
				eventResize : calendarEventResize,
				eventClick : calendarEventClick,
				eventDrop : calendarEventDrop

			});
		});	

		calendar = $('#theCalendar').fullCalendar('getCalendar');
		calendar.addEventSource(eventsArray);
	}


	function processEvent(start, end, jsEvent, view) {

		var multiday = eventIsMultiDay(start, end),
			dayHasEvents = thisDayHasEvent(start.date()),
			viewIsMonth = currentViewIsMonth(view),
			allDayEvent = eventIsAllDay(start, end);

		if(multiday) {

			vm.AddMultiDayEvent(start, end);
		}
		else if(dayHasEvents && viewIsMonth) {

			gotoCalendarDayView(start);
		}
		else if(allDayEvent) {

			addAllDayEvent('Available', start, end);
		}
		else {

			addEvent('Available', start, end);
		}
	}



	function eventIsMultiDay(start, end) {

		if(end.date() - start.date() > 1) {

			return true;
		}
		else {

			return false;
		}
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


	function calendarSelect(start, end, jsEvent, view) {

		processEvent(start, end, jsEvent, view);
	}


	function calendarEventClick(_event, jsEvent, view) {

		setCurrentEvent(_event, jsEvent, view);
	}


	function calendarEventDrop(_event) {

		// There isn't much to be done, as the calendar does the work.
		// We just notify to update the gui
		// TODO
		eventResize(_event);
	}


	function calendarEventResize(_event, delta, revertFunc) {

		if(events.hasOwnProperty(_event.id)) {

			_event.color = defaultEventColor;
			setCurrentEvent(_event);
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

			events[_event.id] = _event;
			currentEvent = events[_event.id];
		}
	}


	function editEvent(_event) {

		setCurrentEvent(_event);

		refreshCalendar();
	}


	function addListenerToCalendarUpdateEvent(listener) {

		listeners.CalendarUpdate.push(listener);
	}


	function removeEvent(_event) {

		if(events.hasOwnProperty(_event.id)) {
			
			delete events[_event.id];

			if(currentEvent.id === _event.id) {

				currentEvent = null;
			}

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


	function getTasksInCurrentMonth() {

		var currentMonth = calendar.getDate().month(),
			returnArray = [],
			iterationEvent = null;

		for(var key in events) {

			if(events.hasOwnProperty(key)) {

				iterationEvent = events[key];

				if(iterationEvent.start.month() === currentMonth) {

					returnArray.push(iterationEvent);
				}
			}
		}

		return returnArray;
	}


	function getTasksInDay(day) {

		var returnArray = [],
			iterationEvent = null;

		for(var key in events) {

			iterationEvent = events[key];

			if(iterationEvent.start.date() === day) {

				returnArray.push(iterationEvent);
			}
		}

		return returnArray;
	}



	// TODO


}());