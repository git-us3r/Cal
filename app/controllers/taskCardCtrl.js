(function(){

    'use strict';

    angular
        .module("Calendar")
        .controller("taskCardCtrl",
                    ['$scope', '$state', '$window', '$swipe', ctrl]);

    function ctrl($scope, $state, $window, $swipe) {

    	var vm = this,
            pageContainer = document.getElementById("taskCardMainContainer"),
            meterBar = {

                Start : 0,
                End : 0,
                TopHalf : (document.getElementById('meterWrapper').clientHeight / 2) - 30,
                BottomHalf : (document.getElementById('meterWrapper').clientHeight / 2) + 30
            },
            meterBarInterval = {

                Short : 250 / (17 * 4),
                Long : 250 / 17,

            },
            timeInterval = {

                Short : 15,
                Long : 60
            },
            meterTime = {

                Start : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                End : moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0}),
                MinStart : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                MaxStart : moment({y: 2015, M: 9, d:2, H:23, m:0, s:0, ms:0}),
                MinEnd : moment({y: 2015, M: 9, d:2, H:8, m:0, s:0, ms:0}),
                MaxEnd :moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0})
            };

        // make the page unselectable to avoid the anoying text-like select on user clicks.
        pageContainer.onselectstart = function(){ return false; };

        document.getElementById('meterWrapper').onmousewheel = processMeterScroll;
            

        // ---------------------------------------- END OF HACK

        vm.IncrementStartTime = incrementStartTime;
        vm.DecrementStartTime = decrementStartTime;
        vm.IncrementEndTime = incrementEndTime;
        vm.DecrementEndTime = decrementEndTime;

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

                var scrollCordinates = {x: scrollEvent.offsetX, y: scrollEvent.offsetY};

                if(scrollCordinates.y < meterBar.TopHalf) {

                    // scroll on top-half: modify start time
                    if(scrollEvent.deltaY > 0) {

                        incrementStartTime('Short');
                    }
                    else {

                        decrementStartTime('Short');   
                    }
                }
                else if (scrollCordinates.y > meterBar.BottomHalf) {

                    // scroll on bottom-half: modify start time
                    if(scrollEvent.deltaY > 0) {

                        incrementEndTime('Short');
                    }
                    else {

                        decrementEndTime('Short');
                    }
                }
            });

        }


        function incrementStartTime(duration) {

            if(meterTime.Start.isBefore(meterTime.MaxStart) && shiftCanGetSmaller()) {

                meterTime.Start.add(timeInterval[duration], 'minutes');

                meterBar.Start += meterBarInterval[duration];

                updatePublicProperties();
            }
        }


        function decrementStartTime(duration) {

            if(meterTime.Start.isAfter(meterTime.MinStart)) {

                meterTime.Start.add(-timeInterval[duration], 'minutes');
                meterBar.Start -=  meterBarInterval[duration];

                updatePublicProperties();
            }
        }


        function incrementEndTime(duration) {

            if(meterTime.End.isBefore(meterTime.MaxEnd)) {

                meterTime.End.add(timeInterval[duration], 'minutes');
                meterBar.End -= meterBarInterval[duration];

                updatePublicProperties();
            }
        }


        function decrementEndTime(duration) {

            if(meterTime.End.isAfter(meterTime.MinEnd) && shiftCanGetSmaller()) {

                meterTime.End.add(-timeInterval[duration], 'minutes');
                meterBar.End +=  meterBarInterval[duration];

                updatePublicProperties();
            }
        }


        function shiftCanGetSmaller() {

            var startDay = meterTime.Start.date(),
                endDay = meterTime.End.date(),
                startHourInMinutes = meterTime.Start.hour() * 60 + meterTime.Start.minutes(),
                endHourInMinutes = meterTime.End.hour() * 60 + meterTime.End.minutes(),
                answer = startDay < endDay || (endHourInMinutes - startHourInMinutes > 60);

            return answer;
        }


        function updatePublicProperties() {

            vm.StartTime = meterTime.Start;
            vm.EndTime = meterTime.End;
            vm.MeterTop = meterBar.Start;
            vm.MeterBottom = meterBar.End;
        }

        // Update before returning
        updatePublicProperties();

    	return vm;
    }

}());