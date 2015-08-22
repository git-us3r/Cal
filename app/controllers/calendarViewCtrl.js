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

        vm.CalendarConfig = {
            height : 450,
            editable: true,
            selectable : true,
            header : {

                left : 'month agendaWeek agendaDay',
                center : 'title',
                right : 'today prev,next'
            },
            defaultView : 'agendaDay',
            businessHours : true,
            dayClick : dayClick,
            select : calendarSelect
        };


        function dayClick(date) {
           uiCalendarConfig.calendars.schedCalendar.fullCalendar('changeView', 'agendaDay');
           uiCalendarConfig.calendars.schedCalendar.fullCalendar('gotoDate', date);
        }



        function calendarSelect(start, end, jsEvent, view) {
            
            vm.Logs.push({

                action : 'User selection',
                agent : 'calendarViewCtrl.calendarSelect',
                start : start,
                end : end
            });
        }

        var events = [];

        vm.Events = [];
        vm.Events.push(events);

        return vm;
    }
    
}());