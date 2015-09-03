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

        // ---------------------------------------- END OF HACK

        vm.MeterBar = {

            ShortInterval : 250 / (17 * 4),
            MaxHeight : 250,
            Start : 0,
            End : 0,
            Time : {

                Start : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                End : moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0}),
                MinStartTime : moment({H:7, m:0}),
                MaxStartTime : moment({H:23, m:0}),
                MinEndTime : moment({H:8, m:0}),
                MaxEndTime : moment({H:0, m:0})
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


        function incrementStartTime(time) {

            var maxStartTimeForThisDay = moment({

                y: vm.MeterBar.Time.Start.year(),
                M: vm.MeterBar.Time.Start.month(),
                d: vm.MeterBar.Time.Start.date(),
                H: vm.MeterBar.Time.MaxStartTime.hour(),
                m: vm.MeterBar.Time.MaxStartTime.minute(),
                s: 0,
                ms: 0
            });

            if(vm.MeterBar.Time.Start.isBefore(maxStartTimeForThisDay)) {

                vm.MeterBar.Time.Start.add(time, 'minutes');
                vm.MeterBar.Start += vm.MeterBar.ShortInterval;
            }
        }


        function decrementStartTime(time) {

            var minStartTimeForThisDay = moment({

                y: vm.MeterBar.Time.Start.year(),
                M: vm.MeterBar.Time.Start.month(),
                d: vm.MeterBar.Time.Start.date(),
                H: vm.MeterBar.Time.MinStartTime.hour(),
                m: vm.MeterBar.Time.MinStartTime.minute(),
                s: 0,
                ms: 0
            });

            if(vm.MeterBar.Time.Start.isAfter(minStartTimeForThisDay)) {

                vm.MeterBar.Time.Start.add(time, 'minutes');
                vm.MeterBar.Start -=  vm.MeterBar.ShortInterval;
            }
        }


        function updateStartTime(time) {

            if(time > 0) {

                incrementStartTime(time);
            }
            else {

                decrementStartTime(time);
            }
        }


        function incrementEndTime(time) {

            var maxEndTimeForThisDay = moment({

                y: vm.MeterBar.Time.End.year(),
                M: vm.MeterBar.Time.End.month(),
                d: vm.MeterBar.Time.End.date(),
                H: vm.MeterBar.Time.MaxEndTime.hour(),
                m: vm.MeterBar.Time.MaxEndTime.minute(),
                s: 0,
                ms: 0
            });

            if(vm.MeterBar.Time.End.isBefore(maxEndTimeForThisDay)) {

                vm.MeterBar.Time.End.add(time, 'minutes');
                vm.MeterBar.End -= vm.MeterBar.ShortInterval;
            }
        }


        function decrementEndTime(time) {

            var minEndTimeForThisDay = moment({

                y: vm.MeterBar.Time.End.year(),
                M: vm.MeterBar.Time.End.month(),
                d: vm.MeterBar.Time.Start.date(),
                H: vm.MeterBar.Time.MinEndTime.hour(),
                m: vm.MeterBar.Time.MinEndTime.minute(),
                s: 0,
                ms: 0
            });

            if(vm.MeterBar.Time.End.isAfter(minEndTimeForThisDay)) {

                vm.MeterBar.Time.End.add(time, 'minutes');
                vm.MeterBar.End +=  vm.MeterBar.ShortInterval;
            }
        }


        function updateEndTime(time) {

            if(time > 0) {

                incrementEndTime(time);
            }
            else {

                decrementEndTime(time);
            }
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