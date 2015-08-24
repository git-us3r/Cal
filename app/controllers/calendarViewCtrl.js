(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarViewCtrl",
					['$scope', '$state', 'uiCalendarConfig', ctrl]);

	function ctrl($scope, $state, uiCalendarConfig) {

		var vm = this,
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
			uniqueId = 0;


		function getUniqueHoverActionId() { return uniqueHoverActionId++; }



		function getUniqueId() { return uniqueId++; }



		function events_getDefaultCollection() {

			var eventArray = [];

			for(var key in events.Collection) {

				eventArray.push(events.Collection[key]);
			}

			return eventArray;
		}




		function eventClickHandler(_event, jsEvent, view) {

			openEventOptionsPrompt(_event, jsEvent.clientX, jsEvent.clientY);
		}



		function openEventOptionsPrompt(_event, xCoordinate, yCoordinate) {

			vm.CurrentEvent = _event;

			var prompt = $('.popover'),
				height = prompt.height(),
				width = prompt.width(),
				left = (xCoordinate) + 'px',
				top = (yCoordinate + 2 * height) + 'px';

		   	$('.popover').show();
		    $('.popover').css('left', left);
		    $('.popover').css('top', top);

		    renderPieChart('Rank', 'chart');

		    vm.ShowEventOptionsPrompt = true;
		}



		function eventOptionsInput(userChoice) {

			vm.ShowEventOptionsPrompt = false;

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
					vm.ShowEventOptionsPrompt = false;
					break;
				default:
					vm.ShowEventOptionsPrompt = false;
					break;
			}
		}



		function removeEvent(_event) {

			delete events.Collection[_event.id];

			uiCalendarConfig.calendars.theCalendar.fullCalendar('removeEvents', [_event.id]);

			updateEvents();

			updateUIEvents();
		}



		function eventResizeHandler(_event, delta, revertFunc) {

			_event.color = events.DefaultEventColor;
			events.Collection[_event.id] = _event;
			updateEvents();
			updateUIEvents();

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

			for(var key in events.Collection) {

				var evnt = events.Collection[key];

				vm.UIEvents.push({
					Title : evnt.title,
					Start : evnt.start.format(),
					End : evnt.end.format(),
					AllDay : evnt.IsAllDay
				});
			}

			vm.UIEvents.push(vm.CurrentEvent);
		}


		function updateEvents() {

			vm.Events[events.DefaultEventCollection] = events.GetEventDefaultCollection();

			// Reset the current event, if any.
			if(vm.CurrentEvent) {

				vm.CurrentEvent = events.Collection[vm.CurrentEvent.id];
			}

			var cal = $('.theCalendar');
			cal.fullCalendar('rerenderEvents');

			renderPieChart('Rank', 'chart');
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
				id : getUniqueId(),
				title : _title,
				start : newEventStart,
				end : newEventEnd,
				isAllDay : true,
				color : 'orange'
			};

			events.Collection[newEvent.id] = newEvent;
		}



		function thisDayHasEvents(day) {

			for(var key in events.Collection) {

				var evnt = events.Collection[key];

				if(evnt.start.date() === day || evnt.end.date() === day) {

					return true;
				}
			}

			return false;
		}
		


		function eventIsAllDay(start, end) {

			var diff = end.diff(start, 'hours');
			return diff === 24;
		}



		function addEvent(_title, _start, _end) {

			var uniqueId = getUniqueId();
			
			events.Collection[uniqueId] = {

				id : uniqueId,
				title : _title,
				start : _start,
				end : _end
			};
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
			updateUIEvents();
			
		}



		function renderPieChart(title, elementId) {

			var dataList = [];
			var workdayInMinutes = 8 * 60;
			var eventDurationInMinutes = getEventDurationInMinutes(vm.CurrentEvent);
			var eventDurationPercentage = eventDurationInMinutes / workdayInMinutes * 100; 		// 8-hour day
			vm.CurrentEventTotalHours = eventDurationInMinutes / 60;


			dataList.push(

				['Crushed', eventDurationInMinutes / 60],
				['Slacked', (workdayInMinutes / 60) - (eventDurationInMinutes / 60) ]
			);

			new Highcharts.Chart({
				chart: {
					 renderTo: elementId,
					 plotBackgroundColor: null,
					 plotBorderWidth: null,
					 plotShadow: false
				},
				title: {
					 text: title
				},
				tooltip: {
					 formatter: function() {
						  return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
					 }
				},
				plotOptions: {
					 pie: {
						  allowPointSelect: true,
						  cursor: 'pointer',
						  dataLabels: {
								enabled: true,
								color: '#000000',
								connectorColor: '#000000',
								formatter: function() {
									 return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
								}
						  }
					 }
				},
				series: [{
					 type: 'pie',
					 name: title,
					 data: dataList
				}]
			});
		 };



		 function getEventDurationInMinutes(_event) {

		 	var startTimeInMinutesFromZero = _event.start.hour() * 60 + _event.start.minute();
		 	var endTimeInMinutesFromZero = _event.end.hour() * 60 + _event.end.minute();
		 	var differenceInMinutes = endTimeInMinutesFromZero - startTimeInMinutesFromZero;	// greater than 0
		 	return differenceInMinutes;
		 }

		//////////////////////////// Setup vm's public interface ///////////////

		vm.Events = [[]];
		vm.UIEvents = [];
		vm.ShowEventOptions = false;
		vm.ShowEventOptionsPrompt = false;
		vm.CurrentEvent = {};

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
			select : calendarSelect,
			eventResize : eventResizeHandler,
			eventClick : eventClickHandler
		};

		vm.EventOptionsInput = eventOptionsInput;
		vm.AddTimeToCurrentEvent = addTimeToCurrentEvent;

		return vm;
	}
	
}());