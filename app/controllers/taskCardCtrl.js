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

        document.getElementById('meterWrapper').onmousewheel = processMeterScroll;

        // ---------------------------------------- END OF HACK

        vm.MeterBar = {

            ShortInterval : 250 / (17 * 4),
            LongInterval : 250 / 17,
            MaxHeight : 250,
            Start : 0,
            End : 0,
            Time : {

                Start : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                End : moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0}),
                MinStartTime : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                MaxStartTime : moment({y: 2015, M: 9, d:2, H:23, m:0, s:0, ms:0}),
                MinEndTime : moment({y: 2015, M: 9, d:2, H:8, m:0, s:0, ms:0}),
                MaxEndTime :moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0})
            }
        };

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


        function processMeterScroll (scrollEvent) {
            
            $scope.$apply(function(){

                var meterHeight = document.getElementById('meter').offsetHeight,
                    scrollCordinates = {x: scrollEvent.offsetX, y: scrollEvent.offsetY},
                    meterCenterHeight = meterHeight/2;

                if(scrollCordinates.y < meterCenterHeight) {

                    // scroll on top-half: modify start time
                    if(scrollEvent.deltaY > 0) {

                        updateStartTime(60);
                    }
                    else {

                        updateStartTime(-60);   
                    }
                }
                else if (scrollCordinates.y > meterCenterHeight) {

                    // scroll on bottom-half: modify start time
                    if(scrollEvent.deltaY > 0) {

                        updateEndTime(60);
                    }
                    else {

                        updateEndTime(-60);   
                    }
                }
            });

        }


        function incrementStartTime(time) {

            if(vm.MeterBar.Time.Start.isBefore(vm.MeterBar.Time.MaxStartTime)) {

                vm.MeterBar.Time.Start.add(time, 'minutes');

                if(time === 15) {

                    vm.MeterBar.Start += vm.MeterBar.ShortInterval;    
                }
                else {

                    vm.MeterBar.Start += vm.MeterBar.LongInterval;   
                }
                
            }
        }


        function decrementStartTime(time) {

            if(vm.MeterBar.Time.Start.isAfter(vm.MeterBar.Time.MinStartTime)) {

                vm.MeterBar.Time.Start.add(time, 'minutes');
                vm.MeterBar.Start -=  vm.MeterBar.ShortInterval;
            }
        }


        function updateStartTime(time) {

            if(time > 0 && shiftCanGetSmaller()) {

                incrementStartTime(time);
            }
            else if (time < 0) {

                decrementStartTime(time);
            }
        }


        function incrementEndTime(time) {

            if(vm.MeterBar.Time.End.isBefore(vm.MeterBar.Time.MaxEndTime)) {

                vm.MeterBar.Time.End.add(time, 'minutes');
                vm.MeterBar.End -= vm.MeterBar.ShortInterval;
            }
        }


        function decrementEndTime(time) {

            if(vm.MeterBar.Time.End.isAfter(vm.MeterBar.Time.MinEndTime)) {

                vm.MeterBar.Time.End.add(time, 'minutes');
                vm.MeterBar.End +=  vm.MeterBar.ShortInterval;
            }
        }


        function updateEndTime(time) {

            if(time > 0) {

                incrementEndTime(time);
            }
            else if(shiftCanGetSmaller()) {

                decrementEndTime(time);
            }
        }

        function shiftCanGetSmaller() {

            var startDay = vm.MeterBar.Time.Start.date(),
                endDay = vm.MeterBar.Time.End.date(),
                startHourInMinutes = vm.MeterBar.Time.Start.hour() * 60 + vm.MeterBar.Time.Start.minutes(),
                endHourInMinutes = vm.MeterBar.Time.End.hour() * 60 + vm.MeterBar.Time.End.minutes(),
                answer = startDay < endDay || (endHourInMinutes - startHourInMinutes > 60);

            return answer;
        }

        vm.AddTime = function(position, time) {

            switch(position) {

                case 'Start':
                    updateStartTime(time);
                    break;
                case 'End':
                    updateEndTime(time);
                    break;
            }
        }

    	return vm;
    }

}());