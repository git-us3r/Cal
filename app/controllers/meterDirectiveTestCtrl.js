(function(){

	'use strict';

	angular
		.module("Calendar")
		.controller("meterDirectiveTestCtrl",
					['$scope', '$state', ctrl]);

	function ctrl(){

		var vm = this;

		vm.DayEvents = [

			{
				id : 'Available',
				start : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
        		end : moment({y: 2015, M: 9, d:2, H:11, m:0, s:0, ms:0})
			},
			{
				id : 'Available',
				start : moment({y: 2015, M: 9, d:2, H:13, m:0, s:0, ms:0}),
        		end : moment({y: 2015, M: 9, d:2, H:16, m:0, s:0, ms:0})
			},
			{
				id : 'Available',
				start : moment({y: 2015, M: 9, d:2, H:19, m:0, s:0, ms:0}),
        		end : moment({y: 2015, M: 9, d:2, H:23, m:0, s:0, ms:0})
			},
			{
				id : 'Available',
				start : moment({y: 2015, M: 9, d:3, H:7, m:0, s:0, ms:0}),
        		end : moment({y: 2015, M: 9, d:3, H:23, m:0, s:0, ms:0})
			},
			{
				id : 'Available',
				start : moment({y: 2015, M: 9, d:4, H:7, m:0, s:0, ms:0}),
        		end : moment({y: 2015, M: 9, d:4, H:13, m:0, s:0, ms:0})
			}
		];

		vm.CurrentEvent = vm.DayEvents[0];

		vm.Msg = 'Directive Test Ground';

		vm.ViewEvent = function() {

			// TODO
		};

        return vm;
	}

}());