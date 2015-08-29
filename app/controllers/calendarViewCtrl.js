(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarViewCtrl",
					['$scope', '$state', ctrl]);

	function ctrl($scope, $state) {

		var vm = $scope,
			uniqueId = 0,
			handlerStrategyFactory = Using.Require('HandlerStrategyFactory'),
			calendarSelectStrategyKey = handlerStrategyFactory.Strategies.CalendarSelectStrategy,
			eventManager = Using.Require('EventManager');


		// Setup vm's public interface 
		
		vm.CurrentEvent = {};
		vm.Events = [];
		vm.calendarSelectStrategy = handlerStrategyFactory.Create(calendarSelectStrategyKey, vm);
		vm.AddEvent = eventManager.AddEvent;
		vm.AddAllDayEvent = eventManager.AddAllDayEvent;
		vm.AddMultiDayEvent = eventManager.AddMultiDayEvent;
		vm.Update = update;
		vm.GotoCalendarDayView = eventManager.GotoCalendarDayView;
		vm.EventOptionsInput = eventOptionsInput;
		vm.AddTimeToCurrentEvent = addTimeToCurrentEvent;
		vm.ThisDayHasEvents = eventManager.ThisDayHasEvent;

		// Setup calendar

		eventManager.Init({

			select: vm.calendarSelectStrategy.ProcessEvent,
			eventResize : eventResizeHandler,
			eventClick : eventClickHandler
		 });

		///////////////////////////////////////////////////////////////////////


		function getUniqueId() { return uniqueId++; }



		function eventClickHandler(_event, jsEvent, view) {

			vm.CurrentEvent = _event;
		}



		function eventOptionsInput(userChoice) {

			switch(userChoice) {

				case 'edit':
					// Go to day view
					uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView', 'agendaDay');
					uiCalendarConfig.calendars.theCalendar.fullCalendar('gotoDate', moment(vm.CurrentEvent.start));
					break;
				case 'delete':
					removeEvent(vm.CurrentEvent);
					break;
				case 'close':
					// display default view stats card
					break;
				default:
					// display default view for stats card
					break;
			}
		}



		function removeEvent(_event) {

			if(_event) {

				delete events.Collection[_event.id];

				vm.CurrentEvent = null;

				uiCalendarConfig.calendars.theCalendar.fullCalendar('removeEvents', [_event.id]);
				
				update(); 
			}
		}



		function eventResizeHandler(_event, delta, revertFunc) {

			events.Collection[_event.id].color = events.DefaultEventColor;
			events.Collection[_event.id].start = _event.start;
			events.Collection[_event.id].end = _event.end;
			update();
		}



		function updateUI() {

			if(vm.CurrentEvent) {

				vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay = getEventDurationInMinutes(vm.CurrentEvent);

				vm.CurrentEvent.TotalHours = vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay / 60;		

				updateStatusBar();
			}
			else {

				// Implement default stats card behavior
			}
		}


		function updateStatusBar() {

			var bar = document.getElementById('statusBar'),
				currentEventDurationPercentage = getEventPercentageValue(vm.CurrentEvent);

			bar.style.width = currentEventDurationPercentage + '%';

		}



		function updateEvents() {

			vm.Events = eventManager.GetEvents();

			// Reset the current event, if any.
			if(vm.CurrentEvent) {

				for(var i = 0; i < vm.Events.length; ++i) {

					if(vm.Events[i].id === vm.CurrentEvent.id) {

						vm.CurrentEvent = vm.Events[i];
					}
				}

				// not found
				vm.CurrentEvent = null;
			}
		}



		function update() {

			updateEvents();
			updateUI();
		}


		function addTimeToCurrentEvent(timeSection, time, timeUnit) {

			if(timeSection === 'start') {

				events.Collection[vm.CurrentEvent.id].start = events.Collection[vm.CurrentEvent.id].start.add(time, timeUnit);
			}
			else {

				events.Collection[vm.CurrentEvent.id].end = events.Collection[vm.CurrentEvent.id].end.add(time, timeUnit);
			}

			events.Collection[vm.CurrentEvent.id].color = events.DefaultEventColor;
			updateEvents();
			updateUI();
			
		}



		function getEventPercentageValue(_event) {

			var workdayInMinutes = 8 * 60,
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

		return vm;
	}
	
}());