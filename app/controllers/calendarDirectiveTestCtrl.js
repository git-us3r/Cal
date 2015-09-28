(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarDirectiveTestCtrl",
					['$scope', ctrl]);

	function ctrl($scope){

		var vm = $scope;

		vm.Message = "Cal Dir Test Ctrl"
		vm.EventCollection = Using.Require('EventCollection');
		vm.WorkDayInHours = 17;

        return vm;
	}

}());