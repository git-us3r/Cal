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
		
		vm.DayStats = {

			HasDay : false,
			Day : null,
			TotalHours : 0,
			HoursPerTask : {}
		};
		
		vm.MonthStats = {

			TotalHours : 0,
			TotalHoursAsPercentageOfWorkMonth : null,
			HoursPerDay : {},
			HasStats : false,

		};

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
		loadDefaultUIElements();

		eventManager.AddListenerToCalendarUpdateEvent(calendarUpdateCallback);

		///////////////////////////////////////////////////////////////////////

		function loadDefaultUIElements() {

			vm.StatsCardDayVisible = false;
			vm.StatusBarDayVisible = false;

			vm.StatsCardTaskVisible = false;
			vm.StatusBarTaskCardVisible = false;

			vm.StatsCardMonthVisible = false;

			vm.StatsCardDefaultVisible = true;
			vm.StatsCardMonthDefaultVisible = true;
		}


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

			updateTaskStats();
			updateDayStats();		
			updateMonthStats();			
		}


		function updateTaskStats() {

			updateTaskStatsCard();
			updateTaskStatusBar();
		}		


		function updateTaskStatsCard() {

			if(vm.CurrentEvent) {

				var eventDurationInMinutes = eventManager.GetEventDurationInMinutes(vm.CurrentEvent);

				vm.CurrentEvent.TotalHoursAsPercentageOfWorkDay = eventDurationInMinutes / (8 * 60);

				vm.CurrentEvent.TotalHours = eventDurationInMinutes / 60;

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

				vm.StatsCardTaskVisible = true;
				vm.StatusBarTaskCardVisible = true;
				
				vm.StatsCardDefaultVisible = false;
				vm.StatusBarDefaultVisible = false;

				// Day and task cards are exclusive
				vm.StatsCardDayVisible = false;
				vm.StatusBarDayVisible = false;
			}
			else {

				vm.StatsCardTaskVisible = false;
				vm.StatusBarTaskCardVisible = false;
				
				vm.StatsCardDefaultVisible = true;
				vm.StatusBarDefaultVisible = true;
			}

		}


		function updateTaskStatusBar() {

			var	currentEventDurationPercentage = eventManager.GetEventPercentageValue(vm.CurrentEvent);

			if(currentEventDurationPercentage > 0) {

				vm.StatuBarTaskVisible = true;
				vm.StatusBarTaskWidth = currentEventDurationPercentage + '%';
			}
			else {

				vm.StatuBarTaskVisible = false;
			}

		}


		function updateMonthStats() {
			
			updateMonthStatsCard();
			updateMonthStatusBar();
		}


		function updateMonthStatsCard() {

			var tasksInCurrentMonth = null,
				task = null,
				iterator = 0;

			tasksInCurrentMonth = eventManager.GetTasksInCurrentMonth();

			if(tasksInCurrentMonth.length > 0) {

				// Compute hours per day
				for(var iterator = 0; iterator < tasksInCurrentMonth.length; ++iterator) {

					task = tasksInCurrentMonth[iterator];

					vm.MonthStats.TotalHours += eventManager.GetEventDurationInMinutes(task) / 60;

					if(vm.MonthStats.HoursPerDay.hasOwnProperty(task.start.date())) {

						vm.MonthStats.HoursPerDay[task.start.date()] += eventManager.GetEventDurationInMinutes(task) / 60;
					}
					else {

						vm.MonthStats.HoursPerDay[task.start.date()] = eventManager.GetEventDurationInMinutes(task) / 60;
					}
				}

				vm.MonthStats.TotalHoursAsPercentageOfWorkMonth = vm.MonthStats.TotalHours / 160;

				vm.StatsCardMonthVisible = true;
				vm.StatsCardMonthDefaultVisible = false;
			}
			else {

				vm.MonthStats.HasStats = false;

				vm.StatsCardMonthVisible = false;
				vm.StatsCardMonthDefaultVisible = true;
			}
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

			var tasksInDay = eventManager.GetTasksInDay(vm.DayStats.Day),
				iterator = 0,
				iterationTask = null;

			if(tasksInDay.length > 0 && !vm.StatsCardTaskVisible) {

				for(iterator = 0; iterator < tasksInDay.length; ++iterator) {

					iterationTask = tasksInDay[iterator];

					vm.DayStats.TotalHours += eventManager.GetEventDurationInMinutes(iterationTask) / 60;

					if(vm.DayStats.HoursPerTask.hasOwnProperty(iterationTask.id)) {

						vm.DayStats.HoursPerTask[iterationTask.id] += eventManager.GetEventDurationInMinutes(iterationTask) / 60;
					}
					else {

						vm.DayStats.HoursPerTask[iterationTask.id] = eventManager.GetEventDurationInMinutes(iterationTask) / 60;	
					}
				}

				vm.DayStats.TotalHoursAsPercentageOfWorkDay = vm.DayStats.TotalHours / 8;

				vm.StatsCardDayVisible = true;
				vm.StatusBarDayVisible = true;
				
				vm.StatsCardDefaultVisible = false;
				vm.StatusBarDefaultVisible = false;

				vm.StatsCardTaskVisible = false;
				vm.StatusBarTaskCardVisible = false;		
			}
			else if(vm.StatsCardTaskVisible) {

				vm.StatsCardDayVisible = false;
				vm.StatusBarDayVisible = false;
			}
			else {

				vm.StatsCardDefaultVisible = true;
				vm.StatusBarDefaultVisible = true;
			}
		}


		function updateDayStatusBar() {

			var bar = document.getElementById('dayStatusBar'),
				dayHoursAsPercentage = vm.DayStats.TotalHoursAsPercentageOfWorkDay;

			if(dayHoursAsPercentage > 0) {

				bar.style.visibility = 'show';
				bar.style.width = dayHoursAsPercentage + '%';
			}
			else {

				bar.style.visibility = 'hidden';
			}
		}


		function updateEvents() {

			vm.Events = eventManager.GetEvents();

			vm.CurrentEvent = eventManager.GetCurrentEvent();

			if(vm.CurrentEvent) {
				
				vm.DayStats.HasEvents = true;
				vm.DayStats.Day = vm.CurrentEvent.start.date();
			}
			else if(vm.DayStats) {

				vm.DayStats.HasEvents = false;
				vm.DayStats.Day = null;
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