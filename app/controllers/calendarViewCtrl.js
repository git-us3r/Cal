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
		vm.GotoCalendarDayView = eventManager.GotoCalendarDayView;
		vm.ThisDayHasEvents = eventManager.ThisDayHasEvent;

		vm.Update = update;
		
		vm.EventOptionsInput = eventOptionsInput;
		vm.AddTimeToCurrentEvent = addTimeToCurrentEvent;		

		// Setup calendar

		eventManager.Init({

			select: vm.calendarSelectStrategy.ProcessEvent,
			eventClick : eventClickHandler
		 });

		vm.ForceRefresh = false;

		eventManager.AddListenerToCalendarUpdateEvent(calendarUpdateCallback);

		///////////////////////////////////////////////////////////////////////

		function calendarUpdateCallback(eventsArray, currentEvent) {

			update();
		}


		function eventClickHandler(_event, jsEvent, view) {

			eventManager.SetCurrentEvent(_event);
			vm.CurrentEvent = eventManager.GetCurrentEvent();
			update();
		}



		function eventOptionsInput(userChoice) {

			switch(userChoice) {

				case 'edit':
					eventManager.GotoCalendarDayView(vm.CurrentEvent.start);
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


		function updateUI() {

			if(vm.CurrentEvent) {

				vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay = getEventDurationInMinutes(vm.CurrentEvent);

				vm.CurrentEvent.TotalHours = vm.CurrentEvent.end.hour() - vm.CurrentEvent.start.hour();

				vm.CurrentEvent.DisplayTime = {

					start : moment({

						hour: vm.CurrentEvent.start.hour(),
						minute : vm.CurrentEvent.start.minute()
					}).format('h:mmA'),
					end : moment({

						hour: vm.CurrentEvent.end.hour(),
						minute : vm.CurrentEvent.end.minute()
					}).format('h:mmA')
				};

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

			vm.CurrentEvent = eventManager.GetCurrentEvent();
		}



		function update() {

			$scope.$apply(function(){

				updateEvents();
				updateUI();
			});
		}


		function addTimeToCurrentEvent(timeSection, time, timeUnit) {

			if(timeSection === 'start') {

				vm.CurrentEvent.start = vm.CurrentEvent.start.add(time, timeUnit);
			}
			else {

				vm.CurrentEvent.end = vm.CurrentEvent.end.add(time, timeUnit);
			}

			vm.CurrentEvent.color = eventManager.DefaultEventColor;

			eventManager.EditEvent(vm.CurrentEvent);			
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

		return vm;
	}
	
}());