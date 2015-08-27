(function(){

	var eventsArray = [],
		eventsIndex = {},		// key: eventId, value: event index in eventsArray
		eventsRemoved = [],		// It's more like a stack
		currentEvent = null,
		publicInterface = {

			AddEvent : addSingleEvent,
			AddAllDayEvent : addAllDayEvent,
			AddMultiDayEvent : addMultiDayEvent,
			GetCurrentEvent : getCurrentEvent,
			RemoveEvent : removeEvent,
			GetEventById : getEventById,
			GetEventsArray : getEvents,
			UndoRemove : recoverLastEventRemoved
		};


	Using.Expose('EventManager', publicInterface);	
	
	//////////////////////////////////////////////////////////////////////////////

	function addSingleEvent (_title, _start, _end) {
		
		var eventId = start.id + end.id,
			newEvent = {

				id : eventId,
				title : _title,
				start : _start,
				end : _end
			};

		addEvent(newEvent);
	}


	function addMultiDayEvent(start, end) {

		var startDay = start.date(),
			endDay = end.date(),
			daysInBetween = endDay - startDay;

		addAllDayEvent('Available', start, moment(start).add(1, 'days'));	

		for(var i = 1; i < daysInBetween; ++i) {

			addAllDayEvent('Available', moment(start).add(i, 'days'), moment(start).add(i + 1, 'days'));
		}
	}


	function addAllDayEvent(_title, _start, _end) {

		if(thisDayHasEvents(_start.date())) {

			return;
		}

		var year = _start.year();
		var month = _start.month();
		var day = _start.date();
		
		var newEventStart = moment({
			y : year,
			M : month,
			d : day,
			h : 9,
			m : 0,
			s : 0,
			ms : 0

		});

		var newEventEnd = moment({
			y : year,
			M : month,
			d : day,
			h : 18,
			m : 0,
			s : 0,
			ms : 0
		});
		
		var newEvent = {
			id : _start.id + _end.id,
			title : _title,
			start : newEventStart,
			end : newEventEnd,
			isAllDay : true,
			color : 'orange'
		};

		addEvent(newEvent);
	}


	function addEvent(newEvent) {

		eventsIndex[newEvent.id] = eventsArray.length;
		eventsArray.push(newEvent);	
		currentEvent = newEvent;
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

			// keep it around for a while
			sendToRetrievableGarbage(_event);
		}
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