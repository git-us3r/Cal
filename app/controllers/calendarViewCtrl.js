(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarViewCtrl",
					['$scope', '$state', 'uiCalendarConfig', ctrl]);

	function ctrl($scope, $state, uiCalendarConfig) {

		var vm = this,
			events = [[]],
			defaultEventCollection = 0,
			currentEvent = {},
			deleteEvent = false,
			editEvent = false;



		function eventClickHandler(_event, jsEvent, view) {

			openEventOptionsPrompt(_event);
		}



		function openEventOptionsPrompt(_event) {

			currentEvent = _event;

			// Launch a modal switch for now?
			$('#myModal').modal('show');
		}



		function eventOptionsInput(userChoice) {

			switch(userChoice) {

				case 'edit':
					// Go to day view
					uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView', 'agendaDay');
					uiCalendarConfig.calendars.theCalendar.fullCalendar('gotoDate', moment(currentEvent.start));
					break;
				case 'delete':
					removeEvent(currentEvent);
					break;
				default:
					// Do nothing
					break;
			}
		}



		function removeEvent(_event) {

			var newEventCollection = [];

			uiCalendarConfig.calendars.theCalendar.fullCalendar('removeEvents', [_event._id]);

			// iterate over the events array and remove the element with matching _id.
			for(var i = 0; i < events[defaultEventCollection].length; ++i) {

				if(events[defaultEventCollection][i]._id !== _event._id) {

					newEventCollection.push(events[defaultEventCollection][i]);
				}
			}

			events[defaultEventCollection] = newEventCollection;

			updateEvents();
			updateUIEvents();
		}



		function eventResizeHandler(event, delta, revertFunc) {

			var eventId = event._id;
			var eventIndex = getEventIndexFromCollection(defaultEventCollection, eventId);

			events[defaultEventCollection][eventIndex] = event;
			updateEvents();
			updateUIEvents();

		}



		function getEventIndexFromCollection(eventCollectionIndex, eventId) {

			for(var i = 0; i < events[eventCollectionIndex].length; ++i) {

				var evnt = events[eventCollectionIndex][i];
				
				if(evnt._id === eventId) {

					return i;
				}
			}

			return null;
		}


		function calendarSelect(start, end, jsEvent, view) {

			if(eventIsMultiDay(start, end)) {

				addMultiDayEvent(start, end);
			}
			else if(thisDayHasEvents(start.date()) && currentViewIsMonth()) {

				// Go to day view
				uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView', 'agendaDay');
				uiCalendarConfig.calendars.theCalendar.fullCalendar('gotoDate', moment(start));
			}
			else if(eventIsAllDay(start, end)) {

				addAllDayEvent('Available', start, end);
			}
			else {

				addEvent('Available', start, end);
			}

			updateEvents();
			updateUIEvents();
		}



		function updateUIEvents() {

			vm.UIEvents = [];

			for(var i = 0; i < events[defaultEventCollection].length; ++i) {

				var evnt = events[defaultEventCollection][i];

				vm.UIEvents.push({
					Title : evnt.title,
					Start : evnt.start.format(),
					End : evnt.end.format(),
					AllDay : evnt.IsAllDay
				});
			}
		}


		function updateEvents() {

			vm.Events = events;
			var cal = $('.theCalendar');
			cal.fullCalendar('rerenderEvents');
			vm.DigestSwitch = !vm.DigestSwitch;
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



		function eventIsMultiDay(start, end) {

			if(end.date() - start.date() > 1) {

				return true;
			}
			else {

				return false;
			}
		}



		function currentViewIsMonth() {

			var view = uiCalendarConfig.calendars.theCalendar.fullCalendar('getView');

			if(view.intervalUnit === 'month') {

				return true;
			}

			return false;
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
				title : _title,
				start : newEventStart,
				end : newEventEnd,
				isAllDay : true
			};

			events[defaultEventCollection].push(newEvent);
		}



		function thisDayHasEvents(day) {

			for(var i = 0; i < events[defaultEventCollection].length; ++i) {

				var calendarEvnt = events[defaultEventCollection][i];
				var calendarDay = calendarEvnt.start.date();

				if(day === calendarDay) {

					return true;
				}
			}	
		}
		


		function eventCollectionHasAllDay(eventCollectionIndex, day) {

			for(var i = 0; i < events[eventCollectionIndex].length; ++i) {

				var calendarEvnt = events[eventCollectionIndex][i];
				var calendarDay = calendarEvnt.start.date();

				if(day === calendarDay && calendarEvnt.isAllDay) {

					return true;
				}
			}			
		}


		function eventIsAllDay(start, end) {

			var diff = end.diff(start, 'hours');
			return diff === 24;
		}



		function addEvent(_title, _start, _end) {

			events[defaultEventCollection].push({

				title : _title,
				start : _start,
				end : _end
			});
		}


		//////////////////////////// Setup vm's public interface ///////////////

		vm.DigestSwitch = false;
		vm.Events = events;
		vm.UIEvents = [];
		vm.ShowEventOptions = false;

		vm.CalendarConfig = {

			height : 450,
			editable: true,
			selectable : true,
			header : {

				left : 'month agendaDay',
				center : 'title',
				right : 'today prev,next'
			},
			defaultView : 'month',
			businessHours : true,
			select : calendarSelect,
			eventResize : eventResizeHandler,
			eventClick : eventClickHandler
		};

		vm.EventOptionsInput = eventOptionsInput;

		return vm;
	}
	
}());