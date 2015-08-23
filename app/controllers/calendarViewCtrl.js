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

					left : 'month agendaWeek agendaDay',
					center : 'title',
					right : 'today prev,next'
				},
				defaultView : 'month',
				businessHours : true,
				select : calendarSelect
			};
		}());



		function calendarSelect(start, end, jsEvent, view) {
			
			logEvent(start, end);

			if(dayHasEvents(start) && currentViewIsMonth()) {

				// Go to day view
				uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView', 'agendaDay');
				uiCalendarConfig.calendars.theCalendar.fullCalendar('gotoDate', moment(start));
			}
			else if(eventIsAllDay(start, end)) {

				addAllDayEvent('Available', start, end);
			}
			else {

				if(eventCollectionHasDay(vm.Calendar.Index_allDayEvents, start.date())) {
			 		
			 		removeAllDayEvent(start.date());			
			 	}

				addEvent('Available', start, end);
			}                          
		}



		function currentViewIsMonth() {

			var view = uiCalendarConfig.calendars.theCalendar.fullCalendar('getView');

			if(view.intervalUnit === 'month') {

				return true;
			}

			return false;
		}



		function removeAllDayEvent(dayOfTheMonth) {

			for(var i = 0; i < vm.Calendar.Events[vm.Calendar.Index_allDayEvents].length; ++i) {

				var eventDay = vm.Calendar.Events[vm.Calendar.Index_allDayEvents][i].start.date();
				
				if(eventDay === dayOfTheMonth) {

					delete vm.Calendar.Events[vm.Calendar.Index_allDayEvents][i];
					--vm.Calendar.Events[vm.Calendar.Index_allDayEvents].length;
				}
			}
		}



		function addAllDayEvent(_title, _start, _end) {

			vm.Calendar.Events[vm.Calendar.Index_allDayEvents].push({

				title : _title,
				start : _start,
				end : _end
			});
		}



		// NOTE: 
		//		If the day had an all-day event, which is default first-click behavior,
		//		said all-day event will exist in the events array.
		// TODO: 
		//  	there needs to be a function which checks every day with events and removes
		//  	the all-day event, in the case that the day has other events.
		function dayHasEvents(start, end) {

			var found = false,
				hourCalendarIndex = vm.Calendar.Index_hourlyEvents,
				dayCalendarIndex = vm.Calendar.Index_allDayEvents,
				testDay = start.date();

			if(eventCollectionHasDay(dayCalendarIndex, testDay) || eventCollectionHasDay(hourCalendarIndex, testDay)) {

				found = true;
			}

			return found;
		}
		

		function eventCollectionHasDay(eventCollectionIndex, day) {

			for(var i = 0; i < vm.Calendar.Events[eventCollectionIndex].length; ++i) {

					var calendarEvnt = vm.Calendar.Events[eventCollectionIndex][i];
					var calendarDay = calendarEvnt.start.date();

					if(day === calendarDay) {

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