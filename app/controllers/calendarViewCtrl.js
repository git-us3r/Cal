(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarViewCtrl",
					['$scope', '$state', 'uiCalendarConfig', ctrl]);

	function ctrl($scope, $state, uiCalendarConfig) {

		var vm = this;

		/////////////////////////////////////////////////////////////////////////////////////

		var uniqueId = 0;

		function getNewId() { return ++uniqueId; }

		// Log
		vm.Logs = [];

		///////////////////////////////////////// CAL ///////////////////////////////////////

		(function configCalendar(){

			vm.Calendar = {

				Events : [],
				Index_hourlyEvents : 1,
				Index_allDayEvents : 0,
			};

			vm.Calendar.Events.push([]);
			vm.Calendar.Events.push([]);

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
			var eventIndex = getEventIndexFromCollection(vm.Calendar.Index_hourlyEvents, eventId);

			vm.Calendar.Events[vm.Calendar.Index_hourlyEvents][eventIndex] = event;

		}



		function getEventIndexFromCollection(eventCollectionIndex, eventId) {

			for(var i = 0; i < vm.Calendar.Events[eventCollectionIndex].length; ++i) {

				var evnt = vm.Calendar.Events[eventCollectionIndex][i];
				
				if(evnt._id === eventId) {

					return i;
				}
			}

			return null;
		}


		function calendarSelect(start, end, jsEvent, view) {
			
			logEvent(start, end);


			if(eventIsMultiDay(start, end)) {

				addMultiDayEvent(start, end);
			}
			else if(dayHasEvents(start) && currentViewIsMonth()) {

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

			uiCalendarConfig.calendars.theCalendar.fullCalendar('rerenderEvents');                          
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

			var year = _start.year();
			var month = _start.month();
			var day = _start.date();
			
			var newEventStart = moment({
				y : year,
				M : month,
				d : day,
				h : 9,
				m : 0,
				s : 0
			});

			var newEventEnd = moment({
				y : year,
				M : month,
				d : day,
				h : 18,
				m : 0,
				s : 0
			});
			
			var newEvent = {
				title : _title,
				start : newEventStart,
				end : newEventEnd,
				isAllDay : true
			};

			vm.Calendar.Events[vm.Calendar.Index_hourlyEvents].push(newEvent);
		}



		function dayHasEvents(start, end) {

			var found = false,
				hourCalendarIndex = vm.Calendar.Index_hourlyEvents,
				dayCalendarIndex = vm.Calendar.Index_allDayEvents,
				testDay = start.date();

			if(eventCollectionHasAllDay(dayCalendarIndex, testDay) || thisDayHasEvents(testDay)) {

				found = true;
			}

			return found;
		}



		function thisDayHasEvents(day) {

			for(var i = 0; i < vm.Calendar.Events[vm.Calendar.Index_hourlyEvents].length; ++i) {

				var calendarEvnt = vm.Calendar.Events[vm.Calendar.Index_hourlyEvents][i];
				var calendarDay = calendarEvnt.start.date();

				if(day === calendarDay) {

					return true;
				}
			}	
		}
		


		function eventCollectionHasAllDay(eventCollectionIndex, day) {

			for(var i = 0; i < vm.Calendar.Events[eventCollectionIndex].length; ++i) {

				var calendarEvnt = vm.Calendar.Events[eventCollectionIndex][i];
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



		function logEvent(start, end) {

			vm.Logs.push({

				action : 'User selection',
				agent : 'calendarViewCtrl.calendarSelect',
				start : start,
				end : end
			});
		}



		function addEvent(_title, _start, _end) {

			vm.Calendar.Events[vm.Calendar.Index_hourlyEvents].push({

				title : _title,
				start : _start,
				end : _end
			});
		}

		return vm;
	}
	
}());