(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarDirectiveTestCtrl",
					['$scope', ctrl]);

	function ctrl($scope){

		var vm = $scope;

		vm.Message = "Cal Dir Test Ctrl"
		vm.Events = {};

        return vm;
	}

}());