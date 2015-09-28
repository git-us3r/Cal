(function(){

	'use strict';

	angular.module('Calendar')
	.directive('calendarDirective', ['$swipe', directiveFunction]);

	var localScope = { 
		
			eventCollection : "=",
			workDayInHours : "="

		},
		events = {},
		eventsArray = [],
		retrievableGarbage = [],
		calendar = null,
		listeners = {CalendarUpdate : []},
		defaultEventColor = '#337AB7',
		allDayEventColor = 'orange',
		viewButtonNextView = 'Day';


	function directiveFunction($swipe){

		return {

			restrict : 'E',
			templateUrl : 'app/views/calendarDirective.html',
			link : linkFunction,
			scope : localScope
		};
	}


	function linkFunction(scope, element, attrs) {

		localScope = scope;
		localScope.ViewButtonNextView = viewButtonNextView;
		localScope.eventCollection.SetWorkDayInHours(localScope.workDayInHours);
		localScope.ButtonClick = buttonClick;

		initCalendar();
	}


	function initCalendar(functions) {

		$(document).ready(function() {

            // page is now ready, initialize the calendar...

            $('#theCalendar').fullCalendar({

				height : 450,
				editable: true,
				selectable : true,
				header : {

					left : '',
					center : 'title',
					right : ''
				},
				eventColor : defaultEventColor,
				eventOverlap : false,
				displayEventEnd : true,
				defaultView : 'month',
				businessHours : true,
				lazyFetching : false,
				slotDuration : '01:00:00',
				select : processEvent,
				eventResize : calendarEventResize,
				eventClick : calendarEventClick,
				eventDrop : calendarEventDrop

			});
		});	

		calendar = $('#theCalendar').fullCalendar('getCalendar');
		calendar.addEventSource(eventsArray);
	}


	function processEvent(start, end, jsEvent, view) {

		var multiday = localScope.eventCollection.EventIsMultiDay(start, end),
			dayHasEvents = localScope.eventCollection.DayHasEvent(start.date()),
			viewIsMonth = currentViewIsMonth(view),
			allDayEvent = localScope.eventCollection.EventIsAllDay(start, end, localScope.workDayInHours);

		if(multiday) {

			addMultiDayEvent(start, end);
		}
		else if(dayHasEvents && viewIsMonth) {

			gotoCalendarDayView(start);
		}
		else if(allDayEvent) {

			addAllDayEvent('Available', start, end);
		}
		else {

			addEvent('Available', start, end);
		}

		refreshCalendar();
	}


	function buttonClick(buttonClicked) {

		switch(buttonClicked) {

			case 'viewButton':

				handleButtonClick_viewButton();				
				break;

			case 'prevButton':
				
				handleButtonClick_prevButton();
				break;

			case 'todayButton':
				
				handleButtonClick_todayButton();
				break;

			case 'nextButton':
				
				handleButtonClick_nextButton();
				break;

			case 'addButton':
				
				handleButtonClick_addButton();
				break;

			case 'deleteButton':
				
				handleButtonClick_deleteButton();
				break;

			default:
				throw 'NotImplementedException: No handling for case: ' + buttonClicked;

		}
	}


	function handleButtonClick_viewButton() {

		var currentEvent = localScope.eventCollection.GetCurrentEvent(),
			currentView = calendar.getView();
		
		if(currentEvent && currentViewIsMonth(currentView.name)) {
		
			viewButtonNextView = (viewButtonNextView === 'Day') ? 'Month' : 'Day';
			localScope.ViewButtonNextView = viewButtonNextView;
			gotoCalendarDayView(currentEvent.start);
		}
		else if(currentViewIsDay(currentView.name)) {

			gotoCalendarMonthView();
		}	
	}


	function handleButtonClick_prevButton() {

		calendar.next();
	}


	function handleButtonClick_todayButton() {

		calendar.today();
	}


	function handleButtonClick_nextButton() {

		calendar.prev();
	}


	function handleButtonClick_addButton() {

		throw 'NotImplementedException: Method: handleButtonClick_addButton'; 
	}


	function handleButtonClick_deleteButton() {

		localScope.eventCollection.RemoveEvent(localScope.eventCollection.GetCurrentEvent());

		refreshCalendar();
	}




	function currentViewIsMonth(view) {

		if(view === 'month') {

			return true;
		}

		return false;
	}


	function currentViewIsDay(view) {

		if(view === 'agendaDay') {

			return true;
		}

		return false;
	}


	function calendarEventClick(_event, jsEvent, view) {

		localScope.$apply(function(){

			localScope.eventCollection.SetCurrentEvent(_event, jsEvent, view);
		});

		if(currentViewIsMonth(calendar.getView().name)) {

			gotoCalendarDayView(localScope.eventCollection.GetCurrentEvent().start);
		}

		refreshCalendar();
	}


	function calendarEventDrop(_event) {

		// There isn't much to be done, as the calendar does the work.
		// We just notify to update the gui
		// TODO
		localScope.$apply(function(){

			localScope.eventCollection.EditEvent(_event);
		});

		refreshCalendar();	
	}


	function calendarEventResize(_event, delta, revertFunc) {

		localScope.$apply(function(){

			localScope.eventCollection.EditEvent(_event);
		});	

		refreshCalendar();
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



	function addAllDayEvent(_title, _start, _end) {

		if(localScope.eventCollection.DayHasEvent(_start.date())) {

			return;
		}

		var year = _start.year();
		var month = _start.month();
		var day = _start.date();
		var nextDaysMonth = moment(_start).add(1, 'days').month();
		var nextDay = moment(_start).add(1, 'days').date();
		
		var newEventStart = calendar.moment({
			y : year,
			M : month,
			d : day,
			h : 7,
			m : 0,
			s : 0,
			ms : 0

		});

		var newEventEnd = calendar.moment({
			y : year,
			M : nextDaysMonth,
			d : nextDay,
			h : 0,
			m : 0,
			s : 0,
			ms : 0
		});
		
		var newEvent = {
			id : Date.now(),
			title : _title,
			start : newEventStart,
			end : newEventEnd,
			isAllDay : true,
			color : 'orange'
		};



		localScope.$apply(function(){

			localScope.eventCollection.AddEvent(newEvent);
		});	
	}



	function addEvent(_title, _start, _end) {

		var newEvent = {

				id : Date.now(),
				title : _title,
				start : _start,
				end : _end
			};

		localScope.$apply(function(){

			localScope.eventCollection.AddEvent(newEvent);
		});	
	}


	function refreshCalendar() {

		calendar.removeEvents();
		calendar.removeEventSource(eventsArray);
		updateEventsArray();
		calendar.addEventSource(eventsArray);
		notifyListenersToCalendarUpdate();

	}


	function notifyListenersToCalendarUpdate() {

		for(var i = 0; i < listeners.CalendarUpdate.length; ++i) {

			listeners.CalendarUpdate[i](eventsArray, currentEvent);
		}
	}


	function updateEventsArray() {

		eventsArray = localScope.eventCollection.GetEventsArray();
	}


	function gotoCalendarDayView (start) {
			
		if(start) {

			calendar.changeView('agendaDay');
			calendar.gotoDate(calendar.moment(start));
		}
	}


	function gotoCalendarMonthView () {
			
		calendar.changeView('month');
	}


	function addListenerToCalendarUpdateEvent(listener) {

		listeners.CalendarUpdate.push(listener);
	}


}());