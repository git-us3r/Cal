(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("calendarDirectiveTestCtrl",
					['$scope', ctrl]);

	function ctrl($scope){

		var vm = $scope;

        return vm;
	}

}());