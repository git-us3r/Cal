(function(){

    'use strict';

    angular
        .module("Calendar")
        .controller("taskCardCtrl",
                    ['$scope', '$state', '$window', ctrl]);

    function ctrl($scope, $state, $window) {

    	var vm = this;

        vm.meterBarTop = 0;
        vm.meterBarBottom = 0;


        function addTime(element, time) {

            if(vm.meterBarBottom + vm.meterBarTop >= 220 && time > 0) {

                return;
            }

            vm[element] += time;

            if(vm[element] < 0) {

                vm[element] = 0;
            }
            else if(vm[element] > 230) {

                vm[element] = 230;
            }
        }

        vm.AddTime = function(position, time) {

            switch(position) {

                case 'top':
                    addTime('meterBarTop', time);
                    break;
                case 'bottom':
                    addTime('meterBarBottom', time);
                    break;
            }
        }

    	return vm;
    }

}());