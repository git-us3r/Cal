(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarViewCtrl",
					['$scope', '$state', 'uiCalendarConfig', ctrl]);

	function ctrl($scope, $state, uiCalendarConfig) {

		var vm = this,
			events = [[]],
			defaultEventCollection = 0;

		vm.Events = events;

		///////////////////////////////////////// CAL ///////////////////////////////////////

		(function configCalendar(){

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
				eventResize : eventResizeHandler
			};
		}());


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
			uiCalendarConfig.calendars.theCalendar.fullCalendar('rerenderEvents');                          
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

		return vm;
	}
	
}());