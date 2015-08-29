(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarViewCtrl",
					['$scope', '$state', 'uiCalendarConfig', ctrl]);

	function ctrl($scope, $state, uiCalendarConfig) {

		var vm = $scope,
			events = {
				DefaultEventCollection : 0,
				CurrentEvent : {},
				Collection : { 

					// The properties of this collection are the events.
				},
				GetEventDefaultCollection : events_getDefaultCollection,
				DefaultEventColor : '#337AB7',
				AllDayEventColor : 'orange'		
			},
			uniqueId = 0,
			handlerStrategyFactory = Using.Require('HandlerStrategyFactory'),
			calendarSelectStrategyKey = handlerStrategyFactory.Strategies.CalendarSelectStrategy,
			calendarSelectStrategy = handlerStrategyFactory.Create(calendarSelectStrategyKey, vm),
			eventManager = Using.Require('EventManager');


		//////////////////////////// Setup vm's public interface ///////////////

		vm.UICalendarConfig = uiCalendarConfig;
		vm.Events = [[]];
		vm.CurrentEvent = {};
		vm.AddEvent = eventManager.AddEvent;
		vm.AddAllDayEvent = eventManager.AddAllDayEvent;
		vm.AddMultiDayEvent = eventManager.AddMultiDayEvent;
		vm.AddTimeToCurrentEvent = addTimeToCurrentEventWrapper;
		vm.Update = update;
		vm.GotoCalendarDayView = gotoCalendarDayView;
		vm.EventOptionsInput = eventOptionsInput;
		vm.CalendarConfig = {

			height : 450,
			editable: true,
			selectable : true,
			header : {

				left : 'month agendaDay',
				center : 'title',
				right : 'today prev,next'
			},
			eventColor : events.DefaultEventColor,
			eventOverlap : false,
			displayEventEnd : true,
			defaultView : 'month',
			businessHours : true,
			select : calendarSelectStrategy.ProcessEvent,
			eventResize : eventResizeHandler,
			eventClick : eventClickHandler
		};

		///////////////////////////////////////////////////////////////////////

		// TODO: Move to strategy asap
		function addTimeToCurrentEventWrapper (timeSection, time, timeUnit) {
			
			eventManager.AddTimeToCurrentEvent(timeSection, time, timeUnit, uiCalendarConfig.calendars.theCalendar);
			update();
		}

		function getUniqueHoverActionId() { return uniqueHoverActionId++; }



		function getUniqueId() { return uniqueId++; }



		function events_getDefaultCollection() {

			var eventArray = [];

			for(var key in events.Collection) {

				eventArray.push(events.Collection[key]);
			}

			return eventArray;
		}



		// TODO: move to eventEventStrategy
		function eventClickHandler(_event, jsEvent, view) {

			vm.CurrentEvent = _event;
			eventManager.SetCurrentEvent(_event);			
		}


		// TODO: move to eventEventStrategy
		function eventOptionsInput(userChoice) {

			switch(userChoice) {

				case 'edit':
					// gotoCalendarDayView(eventDurationInMinutes.CurrentEvent.start);
					break;
				case 'delete':
					removeEvent(eventManager.GetCurrentEvent());
					break;
				case 'close':
					// display default view stats card
					break;
				default:
					// display default view for stats card
					break;
			}
		}


		// TODO: move to eventEventStrategy asap
		function removeEvent(_event) {

			eventManager.RemoveEvent(eventManager.GetCurrentEvent().id);

			delete events.Collection[_event.id];

			uiCalendarConfig.calendars.theCalendar.fullCalendar('removeEvents', [_event.id]);

			update();			
		}


		// TODO: move to eventEventStrategy
		function eventResizeHandler(_event, delta, revertFunc) {

			_event.color = events.DefaultEventColor;
			vm.EventManager.EditEvent(_event);
			update();
		}


		function gotoCalendarDayView (start) {
			
			uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView', 'agendaDay');
			uiCalendarConfig.calendars.theCalendar.fullCalendar('gotoDate', moment(start));
		}



		function updateUI() {

			if(vm.CurrentEvent) {

				vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay = getEventDurationInMinutes(vm.CurrentEvent);
				vm.CurrentEvent.TotalHours = vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay / 60;
				updateStatusBar();
			}
			else {

				// Setup default card
			}
		}


		function updateStatusBar() {

			var bar = document.getElementById('statusBar'),
				currentEventDurationPercentage = getEventPercentageValue(vm.CurrentEvent);

			bar.style.width = currentEventDurationPercentage + '%';

		}


		function updateEvents() {

			var iterator = 0;
			vm.Events[events.DefaultEventCollection].slice(0, vm.Events[events.DefaultEventCollection].length);

			var latestEventsArray = eventManager.GetEventsArray();

			for(iterator = 0; iterator < latestEventsArray.length; ++iterator) {

				vm.Events[events.DefaultEventCollection][iterator] = latestEventsArray[iterator];
			}

			// Sometimes the splice operation fails, Google !?
			for(/* iterator */; iterator < vm.Events[events.DefaultEventCollection].length; ++iterator) {

				vm.Events[events.DefaultEventCollection][iterator] = null;
			}

			vm.CurrentEvent = eventManager.GetCurrentEvent();
		}



		function update() {

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