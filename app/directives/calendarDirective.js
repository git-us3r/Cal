(function(){

	'use strict';

	angular.module('Calendar')
	.directive('calendarDirective', ['$swipe', directiveFunction]);

	function directiveFunction($swipe){

		return {

			restrict : 'E',
			templateUrl : 'app/views/calendarDirective.html',
			link : linkFunction,
			scope : localScope
		};
	}

	var localScope = {};

	function linkFunction(scope, element, attrs) {

		$(document).ready(function() {

            // page is now ready, initialize the calendar...

            $('#theCalendar').fullCalendar({
                // put your options and callbacks here
            })

        });
	}

	// TODO


}());