(function(){

	var eventsArray = [],
		eventsIndex = {},		// key: eventId, value: event index in eventsArray
		eventsRemoved = [],		// It's more like a stack
		currentEvent = null,
		defaultEventColor = '#337AB7',
		allDayEventColor = 'orange',
		publicInterface = {

			AddEvent : addSingleEvent,
			AddAllDayEvent : addAllDayEvent,
			AddMultiDayEvent : addMultiDayEvent,
			AddTimeToCurrentEvent : addTimeToCurrentEvent,
			GetCurrentEvent : getCurrentEvent,
			GetEventById : getEventById,
			GetEventsArray : getEvents,
			SetCurrentEvent : setCurrentEvent,
			EditEvent : editEvent,
			RemoveEvent : removeEvent,
			UndoRemove : recoverLastEventRemoved
		};


	Using.Expose('EventManager', publicInterface);	
	
	//////////////////////////////////////////////////////////////////////////////

	function addSingleEvent (_title, _start, _end) {
		
		var eventId = start.unix() + '_' + end.unix(),
			newEvent = {

				id : eventId,
				title : _title,
				start : _start,
				end : _end
			};

		addEvent(newEvent);
	}


	function addMultiDayEvent(start, end, calendarConfig) {

		var startDay = start.date(),
			endDay = end.date(),
			daysInBetween = endDay - startDay;	

		for(var i = 0; i < daysInBetween; ++i) {

			addAllDayEvent('Available', moment(start).add(i, 'days'), moment(start).add(i + 1, 'days'), calendarConfig);
		}
	}


	function addAllDayEvent(_title, _start, _end, calendarConfig) {

		if(thisDayHasEvents(_start.date())) {

			return;
		}

		var year = _start.year(),
			month = _start.month(),
			day = _start.date()
			startDate = new Date(year, month, day, 9, 0, 0),
			endDate = new Date(year, month, day, 18, 0, 0),
			newEventStart = calendarConfig.calendars.theCalendar.fullCalendar('getCalendar').moment(startDate),
			newEventEnd = calendarConfig.calendars.theCalendar.fullCalendar('getCalendar').moment(endDate),
			newEvent = {
				id : _start.unix() + '_' + _end.unix(),
				title : _title,
				start : newEventStart,
				end : newEventEnd,
				isAllDay : true,
				color : 'orange'
			};

			newEvent.start._d = startDate;
			newEvent.end._d = endDate;

		addEvent(newEvent);
	}


	function addTimeToCurrentEvent(timeSection, time, timeUnit) {

		var currentEventIndex = eventsIndex[currentEvent.id];

		if(currentEvent.isAllDay) {

			currentEvent.isAllDay = false;
		}

		if(timeSection === 'start') {

			currentEvent.start = currentEvent.start.add(time, timeUnit);
		}
		else {

			currentEvent.end = currentEvent.end.add(time, timeUnit);
		}

		currentEvent.color = defaultEventColor;
		
		eventsArray[currentEventIndex] = currentEvent;		
	}


	function addEvent(newEvent) {

		eventsIndex[newEvent.id] = eventsArray.length;
		eventsArray.push(newEvent);	
		currentEvent = eventsArray[eventsArray.length - 1];
	}


	function getEventById(id) {

		return eventsIndex[id];
	}


	function getCurrentEvent() {

		return currentEvent;
	}


	function getEvents() {

		return eventsArray;
	}


	function removeEvent(id) {

		if(eventsIndex.hasOwnProperty(id)) {

			var eventIndex = eventsIndex[id],
				_event = eventsArray[eventIndex];

			delete eventsIndex[id];
			eventsArray.splice(eventIndex, 1);

			if(currentEvent.id === id) {

				currentEvent = null;
			}

			// keep it around for a while
			sendToRetrievableGarbage(_event);
		}
	}


	function setCurrentEvent(_event) {

		currentEvent = _event;
	}


	function editEvent(_event) {

		var index = eventsIndex[_event.id];

		eventsArray[index] = _event;

		currentEvent = eventsArray[index];
	}


	function sendToRetrievableGarbage(_event) {

		eventsRemoved.push(_event);

		// keep the buffer size to 50
		if(eventsRemoved.length > 50) {

			eventsRemoved.splice(0, 10);
		}
	}


	function recoverLastEventRemoved() {

		if(eventsRemoved.length > 0) {

			var eventIndex = eventsRemoved.length - 1,
				_event = eventsRemoved[eventsIndex];

			eventsRemoved.splice(eventsIndex, 1);

			addEvent(_event.title, _event.start, _event.end);
		}
	}


	function thisDayHasEvents(day) {

		for(var i = 0; i < eventsArray.length; ++i) {

			var evnt = eventsArray[i];

			if(evnt.start.date() === day || evnt.end.date() === day) {

				return true;
			}
		}

		return false;
	}

}());