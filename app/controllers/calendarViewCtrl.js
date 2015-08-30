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
		vm.CurrentDay = {};
		vm.CurrentMonth = {};

		vm.Events = [];
		
		vm.calendarSelectStrategy = handlerStrategyFactory.Create(calendarSelectStrategyKey, vm);
		
		vm.AddEvent = eventManager.AddEvent;
		vm.AddAllDayEvent = eventManager.AddAllDayEvent;
		vm.AddMultiDayEvent = eventManager.AddMultiDayEvent;
		vm.GotoCalendarDayView = eventManager.GotoCalendarDayView;
		vm.ThisDayHasEvents = eventManager.ThisDayHasEvent;
		vm.AddTimeToCurrentEvent = eventManager.AddTimeToEvent;

		vm.Update = update;
		
		vm.EventOptionsInput = eventOptionsInput;
		

		// Setup calendar

		eventManager.Init({

			select: vm.calendarSelectStrategy.ProcessEvent,
			eventClick : eventClickHandler
		 });

		// Setup default behavior
		vm.StatsCardTaskVisible = false;
		vm.StatsCardDayVisible = false;
		vm.StatsCardDefault = true;

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
					eventManager.RemoveEvent(vm.CurrentEvent);
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

				updateTaskStats();
				updateMonthStats();

				loadTaskUIElements();
				loadMonthUIElement();

			}
			else if (vm.CurrentDay.HasEvents) {

				updateDayStats();
				updateMonthStats();

				loadDayUIElements();
				loadMonthUIElement();

			}
			else {

				loadDefaultUIElements();
			}
			
		}


		function loadTaskUIElements() {

			// TODO
			vm.StatsCardTaskVisible = true;
			vm.StatusBarTaskVisible = true;
			
			vm.StatsCardDefault = false;
			vm.StatsCardDayVisible = false;
			vm.StatsCardMonthVisible = false;

			vm.StatusBarDayVisible = false;
			vm.StatusBarDayVisible = false;
			vm.StatusBarDefault = false;

			updateTaskStatusBar();
		}


		function loadDayUIElements() {

			// TODO
			vm.StatsCardDayVisible = true;
			vm.StatusBarDayVisible = true;
			
			vm.StatsCardDefault = false;
			vm.StatsCardTaskVisible = false;
			vm.StatsCardMonthVisible = false;

			vm.StatusBarDayVisible = false;
			vm.StatusBarDayVisible = false;
			vm.StatusBarDefault = false;

			updateDayStatusBar();
		}


		function loadMonthUIElement() {

			// TODO
			vm.StatsCardMonthVisible = true;
			vm.StatusBarMonth = true;
		}


		function loadDefaultUIElements() {

			vm.StatsCardDefault = true;
			vm.StatusBarDefault = true;

			vm.StatsCardMonthVisible = false;
			vm.StatsCardDayVisible = false;
			vm.StatsCardTaskVisible = false;
			vm.StatusBarMonth = false;
			vm.StatusBarDayVisible = false;
			vm.StatusBarTaskVisible = false;

		}


		function updateTaskStats() {

			updateTaskStatsCard();
			updateTaskStatusBar();
		}		


		function updateTaskStatsCard() {

			vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay = eventManager.GetEventDurationInMinutes(vm.CurrentEvent);

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
		}


		function updateTaskStatusBar() {

			var bar = document.getElementById('taskStatusBar'),
				currentEventDurationPercentage = eventManager.GetEventPercentageValue(vm.CurrentEvent);

			bar.style.width = currentEventDurationPercentage + '%';

		}


		function updateMonthStats() {
			
			updateMonthStatsCard();
			updateMonthStatusBar();
		}


		function updateMonthStatsCard() {

			var tasksInCurrentMonth = null,
				task = null,
				iterator = 0,
				monthStats = {

					TotalHours : 0,
					TotalHoursAsPercentageOfWorkMonth : null,
					HoursPerDay : {},
				};

			tasksInCurrentMonth = eventManager.GetTasksInCurrentMonth();

			// Compute hours per day
			for(var iterator = 0; iterator < tasksInCurrentMonth.length; ++iterator) {

				task = tasksInCurrentMonth[iterator];

				monthStats.TotalHours += eventManager.GetEventDurationInMinutes(task) / 60;

				if(monthStats.HoursPerDay.hasOwnProperty(task.start.date())) {

					monthStats.HoursPerDay[task.start.date()] += eventManager.GetEventDurationInMinutes(task) / 60;
				}
				else {

					monthStats.HoursPerDay[task.start.date()] = eventManager.GetEventDurationInMinutes(task) / 60;
				}
			}

			monthStats.TotalHoursAsPercentageOfWorkMonth = monthStats.TotalHours / 160;

			// Expose the data to the model
			vm.MonthStats = monthStats;
		}
		

		function updateMonthStatusBar() {

			var bar = document.getElementById('monthStatusBar'),
				monthHoursAsPercentage = vm.MonthStats.TotalHoursAsPercentageOfWorkMonth;

			bar.style.width = monthHoursAsPercentage + '%';

		}


		function updateDayStats() {

			updateDayStatsCard();
			updateDayStatusBar();
		}


		function updateDayStatsCard() {

			var tasksInDay = eventManager.GetTasksInDay(vm.CurrentDay.Day),
				iterator = 0,
				iterationTask = null,
				dayStats = {

					TotalHours : 0,
					TotalHoursAsPercentageOfWorkDay : null,
					HoursPerTask : {},
				};

			for(iterator = 0; iterator < tasksInDay.length; ++iterator) {

				iterationTask = tasksInDay[iterator];

				dayStats.TotalHours += eventManager.GetEventDurationInMinutes(iterationTask) / 60;

				if(dayStats.HoursPerTask.hasOwnProperty(iterationTask)) {

					dayStats.HoursPerTask[iterationTask] += eventManager.GetEventDurationInMinutes(iterationTask) / 60;
				}
				else {

					dayStats.HoursPerTask[iterationTask] = eventManager.GetEventDurationInMinutes(iterationTask) / 60;	
				}
			}

			dayStats.TotalHoursAsPercentageOfWorkDay = dayStats.TotalHours / 8;

			vm.DayStats = dayStats;
		}


		function updateDayStatusBar() {

			var bar = document.getElementById('dayStatusBar'),
				dayHoursAsPercentage = vm.DayStats.TotalHoursAsPercentageOfWorkDay;

			bar.style.width = dayHoursAsPercentage + '%';
		}


		function updateEvents() {

			vm.Events = eventManager.GetEvents();

			vm.CurrentEvent = eventManager.GetCurrentEvent();

			if(vm.CurrentEvent) {
				
				vm.CurrentDay = {

					HasEvents : true,
					Day: vm.CurrentEvent.start.date()
				};
			}
		}



		function update() {

			if(!$scope.$$phase) {

				// If not inside $apply execution, call $apply to update gui
				$scope.$apply(function(){

					updateEvents();
					updateUI();	
				});
			}
			else {

				// .. must be inside an apply loop, just update.
				updateEvents();
				updateUI();	
			}
					
		}


		return vm;
	}
	
}());