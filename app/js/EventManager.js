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
		},
		_uid = 0;


	Using.Expose('EventManager', publicInterface);	
	
	//////////////////////////////////////////////////////////////////////////////

	function getUID() {

		var ret = _uid;
		_uid++;
		return ret;
	}


	function addSingleEvent (_title, theStart, theEnd) {
		
		var eventId = start.unix() + '_' + end.unix(),
			newEvent = {

				id : eventId,
				_id : eventId,
				title : _title,
				start : theStart,
				_start : theStart,
				end : thEnd,
				_end : theEnd
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


	function addAllDayEvent(_title, theStart, theEnd, calendarConfig) {

		if(thisDayHasEvents(theStart.date())) {

			return;
		}

		var year = theStart.year(),
			month = theStart.month(),
			day = theStart.date(),
			uid = getUID(),
			startDate = calendarConfig.calendars.theCalendar.fullCalendar('getCalendar').moment({ y: year, M: month, d: day, h: 9, m: 0, s: 0, ms: 0 }),
			endDate = calendarConfig.calendars.theCalendar.fullCalendar('getCalendar').moment({ y: year, M: month, d: day, h: 18, m: 0, s: 0, ms: 0 }),
			newEvent = {
				id : uid,
				_id : uid,
				title : _title,
				start : startDate,
				_start : startDate,
				end : endDate,
				_end : endDate,
				isAllDay : true,
				color : 'orange'
			};

		addEvent(newEvent);
	}


	function addTimeToCurrentEvent(timeSection, time, timeUnit, calendarConfig) {

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

		// calendarConfig.fullCalendar('updateEvent', eventsArray[currentEventIndex]);	
	}


	function addEvent(newEvent) {

		eventsIndex[newEvent.id] = eventsArray.length;
		eventsArray.push(newEvent);	
		currentEvent = eventsArray[eventsArray.length - 1];
	}


	function getEventById(id) {

		if(eventsIndex.hasOwnProperty(id)) {

			return eventsArray[eventsIndex[id]];
		}
		else {

			return null;
		}
	}


	function getCurrentEvent() {

		if(currentEvent) {

			return eventsArray[eventsIndex[currentEvent.id]];
		}
		else {

			return null;
		}
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