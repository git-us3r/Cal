// 	Depends on:
// 		Using.js
// 		Moment.js

(function(){


	var eventsIndex = {},
		currentEvent = {};


	function getEventsIndex() {

		return eventsIndex;
	}



	function getEventsArray() {

		var eventsArray = [];

		for(var _event in eventsIndex) {

			if(eventsIndex.hasOwnProperty(_event)) {

				eventsArray.push(_event);
			}			
		}

		return eventsArray;
	}


	function thisDayHasEvent(day) {

		for(var key in eventsIndex) {

			if(eventsIndex.hasOwnProperty(key)) {

				var _event = eventsIndex[key];

				if(_event.start.date() === day || _event.end.date() === day) {

					return true;
				}
			}			
		}

		return false;
	}


	function addEvent(_event) {

		if(_events.hasOwnProperty(newEvent.id)) {

			return; 	// _event exists ?!
		}

		eventsIndex[newEvent.id] = newEvent;
		currentEvent = eventsIndex[newEvent.id];
	}


	function getCurrentEvent() {

		return currentEvent;
	}


	function hasEvent(_event) {

		return eventsIndex.hasOwnProperty(_event.id);
	}


	function setCurrentEvent(_event) {

		if(eventsIndex.hasOwnProperty(_event.id)) {

			currentEvent = eventsIndex[_event.id];			
		}
	}


	function editEvent(_event) {

		if(eventsIndex.hasOwnProperty(_event.id)) {

			eventsIndex[_event.id] = _event;
		}
	}


	function addListener() {

		// TODO
	}


	function removeEvent(_event) {

		if(eventsIndex.hasOwnProperty(_event.id)) {

			delete eventsIndex[_event.id];
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


	function getEventAsPercentageOfWorkDay(workDayInMinutes) {

		var eventDurationInMinutes = getEventDurationInMinutes(_event),
			eventDurationPercentage = eventDurationInMinutes / workdayInMinutes * 100;

		return  eventDurationPercentage;
	}


	function getEventDurationInMinutes(_event) {

		var startTimeInMinutesFromZero = _event.start.hour() * 60 + _event.start.minute(),
			endTimeInMinutesFromZero = _event.end.hour() * 60 + _event.end.minute(),
			differenceInMinutes = endTimeInMinutesFromZero - startTimeInMinutesFromZero;	// greater than 0

		return differenceInMinutes;
	}


	function getEventDuration(_event, timeUnit) {

		var eventDurationInMinutes = getEventDurationInMinutes(_event);

		switch(timeUnit) {

			case 'minutes':
				return eventDurationInMinutes;

			case 'hours':
				return eventDurationInMinutes / 60;

			default:
				return null;
		}
	}


	function getEventsInDay(day, month, year) {

		var returnArray = [],
			iterationEvent = null;

		for(var key in eventsIndex) {

			if(eventsIndex.hasOwnProperty(key)) {

				iterationEvent = events[key];

				if(iterationEvent.start.date() === day && iterationEvent.start.month() === month && iterationEvent.year() === year) {

					returnArray.push(iterationEvent);
				}
			}
		}

		return returnArray;
	}


	function getEventsInWeek(isoWeek) {

		var returnArray = [],
			iterationEvent = null;

		for(var key in eventsIndex) {

			if(eventsIndex.hasOwnProperty(key)) {

				iterationEvent = events[key];

				if(iterationEvent.isoWeek() === isoWeek) {

					returnArray.push(iterationEvent);
				}
			}
		}

		return returnArray;
	}


	function getEventsInMonth(month) {

		var returnArray = [],
			iterationEvent = null;

		for(var key in eventsIndex) {

			if(eventsIndex.hasOwnProperty(key)) {

				iterationEvent = events[key];

				if(iterationEvent.start.month() === month || iterationEvent.end.month() === month) {

					returnArray.push(iterationEvent);
				}
			}
		}

		return returnArray;
	}



	Using.Expose('EventCollection', { 

		GetEventsArray : getEventsArray,
		GetEventsIndex : getEventsIndex,
		DayHasEvent : thisDayHasEvent,
		AddEvent : addEvent,
		GetCurrentEvent : getCurrentEvent,
		HasEvent : hasEvent,
		SetCurrentEvent : setCurrentEvent,
		EditEvent : editEvent,
		AddListener : addListener
		RemoveEvent : removeEvent,
		AddTimeToEvent : addTimeToEvent,
		GetEventAsPercentageOfWorkDay: getEventAsPercentageOfWorkDay,
		GetEventDuration: getEventDuration,
		GetEventsInDay : getEventsInDay,
		GetEventsInWeek : getEventsInWeek,
		GetEventsInMonth : getEventsInMonth
	});
}());