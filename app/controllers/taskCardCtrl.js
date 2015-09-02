(function(){

    'use strict';

    angular
        .module("Calendar")
        .controller("taskCardCtrl",
                    ['$scope', '$state', '$window', '$swipe', ctrl]);

    function ctrl($scope, $state, $window, $swipe) {

    	var vm = this,
            pageContainer = document.getElementById("taskCardMainContainer");

        // make the page unselectable to avoid the anoying text-like select on user clicks.
        pageContainer.onselectstart = function(){ return false; };

        vm.meterBarTop = 0;
        vm.meterBarBottom = 0;
        vm.startTime = moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0});
        vm.endTime = moment({y: 2015, M: 9, d:2, H:0, m:0, s:0, ms:0});

        $swipe.bind($('#meterWrapper'), {

            'start': function(coords) {

                vm.startX = coords.x;
                vm.pointX = coords.y;
            },
            'move': function(coords) {

                vm.delta = coords.x - vm.pointX;
            
            },
            'end': function(coords) {
                // ...
            },
            'cancel': function(coords) {
                // ...
          }
        });


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
                    vm.startTime.add(time, 'minutes');
                    break;
                case 'bottom':
                    addTime('meterBarBottom', time);
                    break;
            }
        }

    	return vm;
    }

}());