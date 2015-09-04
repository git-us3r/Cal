(function(){

	'use strict';

	angular.module('Calendar')
	.directive('meterBarDirective' [directiveFunction]);

	function directiveFunction() {

		// Private members
		var directiveObject = {},
			template = 'app/views/meterDirective.html',
			restrict = 'E',
			scope = {

				start : '=',
				end : '='
			},
			pageContainer = document.getElementById("taskCardMainContainer"),
            meterBar = {

                Start : 0,
                End : 0,
                TopHalf : (document.getElementById('meterWrapper').offsetHeight / 2) + 30,
                BottomHalf : (document.getElementById('meterWrapper').offsetHeight / 2) + 40
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

                Start : scope.start,
                End : scope.end,
                MinStart : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                MaxStart : moment({y: 2015, M: 9, d:2, H:23, m:0, s:0, ms:0}),
                MinEnd : moment({y: 2015, M: 9, d:2, H:8, m:0, s:0, ms:0}),
                MaxEnd :moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0})
            };

        // Private Functions

        function processMeterScroll (scrollEvent) {
            
            $scope.$apply(function(){

                var scrollCordinates = {x: scrollEvent.layerX, y: scrollEvent.layerY};

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

            scope.StartTime = meterTime.Start;
            scope.EndTime = meterTime.End;
            scope.MeterTop = meterBar.Start;
            scope.MeterBottom = meterBar.End;
        }    

        // ---------------- HACK

        // make the page unselectable to avoid the anoying text-like select on user clicks.
        pageContainer.onselectstart = function(){ return false; };

        document.getElementById('meterWrapper').onmousewheel = processMeterScroll; // ---------------------------------------- END OF HACK

        // Public interface

        scope.IncrementStartTime = incrementStartTime;
        scope.DecrementStartTime = decrementStartTime;
        scope.IncrementEndTime = incrementEndTime;
        scope.DecrementEndTime = decrementEndTime;


        // Touch

        $swipe.bind($('#meterWrapper'), {

            'start': function(coords) {

            	// ...
            },
            'move': function(coords) {

                // ...
            
            },
            'end': function(coords) {
                // ...
            },
            'cancel': function(coords) {
                // ...
          }
        });


        // Update before returning

        updatePublicProperties();

		// Public interface

		// todo

		return dir;
	}
}());