(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("meterDirectiveTestCtrl",
					['$scope', '$state', ctrl]);

	function ctrl(){

		var vm = this;

		vm.CurrentEvent = {

			Msg : "MeterBar directive below ...",
			Start : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
        	End : moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0})
		};

        return vm;
	}

}());