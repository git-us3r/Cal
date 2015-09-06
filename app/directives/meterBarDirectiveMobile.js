(function(){

	'use strict';

	angular.module('Calendar')
	.directive('meterBarDirectiveMobile', [directiveFunction]);

	function directiveFunction(){

		var meterBar = {

                Start : null,
                End : null,
                TopHalf : null,
                BottomHalf : null
            },
            meterBarInterval = {

                Short : null,
                Long : null
            },
            timeInterval = {

                Short : 15,
                Long : 60
            },
            meterTime = {

                Start : null,
                End : null,
                MinStart : moment({y: 2015, M: 9, d:2, H:7, m:0, s:0, ms:0}),
                MaxStart : moment({y: 2015, M: 9, d:2, H:23, m:0, s:0, ms:0}),
                MinEnd : moment({y: 2015, M: 9, d:2, H:8, m:0, s:0, ms:0}),
                MaxEnd :moment({y: 2015, M: 9, d:3, H:0, m:0, s:0, ms:0})
            },
            processMeterScroll = null;											// This will actually be a function!


		function linkFunction(scope, element, attrs) {
	       	
	       	var jQmeterWrapper = element.find('#meterWrapper_mobile');

	       	// Bind the onmousewheel event of the meterWrapper element to the processMeterScroll function
	       	bindScrollingToWrapper(scope, jQmeterWrapper)

	       	// Make the whole directive unselectable
			element.on('selectstart', function(){ return false; });

			setupMeterBarObjectProperties(jQmeterWrapper[0]);

			setupMeterTimeObjecProperties(scope);

			// Setup scope public properties
	       	scope.IncrementStartTime = incrementStartTime;
	        scope.DecrementStartTime = decrementStartTime;
	        scope.IncrementEndTime = incrementEndTime;
	        scope.DecrementEndTime = decrementEndTime;
	        scope.StartTime = scope.$parent.vm.CurrentEvent.Start;
	        scope.EndTime = scope.$parent.vm.CurrentEvent.End;

	        updatePublicProperties(scope);	        
		}


		// Private Functions

		function setupMeterTimeObjecProperties (scope) {
			
			meterTime.Start = scope.start;
            meterTime.End = scope.end;
		}


		function setupMeterBarObjectProperties(meterWrapper) {

			var workDayDuration = 17,
				centerOffset = 30;


			meterBar.Start = 0;
			meterBar.End = 0;
			meterBar.TopHalf = (meterWrapper.offsetHeight / 2) - 10;					// the middle aint what it seems
			meterBar.BottomHalf = (meterWrapper.offsetHeight / 2) + 10;					// the bottom section starts 10px below the 'middle'

			meterBarInterval.Short = meterWrapper.offsetHeight / (workDayDuration * 4); // map the height to 15-min intervals
			meterBarInterval.Long = meterWrapper.offsetHeight / workDayDuration;		// map the height to 1-hour intervals			

		}


        function bindScrollingToWrapper (scope, wrapper) {

      		// Gotta love clousures!
            
            processMeterScroll = function(scrollEvent) {

            	scope.$apply(function () {

	                var scrollCordinates = {x: scrollEvent.offsetX, y: scrollEvent.offsetY};

	                if(scrollCordinates.y < meterBar.TopHalf) {

	                    // scroll on top-half: modify start time
	                    if(scrollEvent.originalEvent.deltaY > 0) {

	                        scope.IncrementStartTime('Short');
	                    }
	                    else {

	                        scope.DecrementStartTime('Short');   
	                    }
	                }
	                else if (scrollCordinates.y > meterBar.BottomHalf) {

	                    // scroll on bottom-half: modify start time
	                    if(scrollEvent.originalEvent.deltaY > 0) {

	                        scope.IncrementEndTime('Short');
	                    }
	                    else {

	                        scope.DecrementEndTime('Short');
	                    }
	                }
           	 	});
            }


            // Now, it can be safely bound.
            wrapper.on('mousewheel', processMeterScroll);

        }


        function incrementStartTime(duration) {

            if(meterTime.Start.isBefore(meterTime.MaxStart) && shiftCanGetSmaller()) {

                meterTime.Start.add(timeInterval[duration], 'minutes');

                meterBar.Start += meterBarInterval[duration];

                updatePublicProperties(this);
            }
        }


        function decrementStartTime(duration) {

            if(meterTime.Start.isAfter(meterTime.MinStart)) {

                meterTime.Start.add(-timeInterval[duration], 'minutes');
                meterBar.Start -=  meterBarInterval[duration];

                updatePublicProperties(this);
            }
        }


        function incrementEndTime(duration) {

            if(meterTime.End.isBefore(meterTime.MaxEnd)) {

                meterTime.End.add(timeInterval[duration], 'minutes');
                meterBar.End -= meterBarInterval[duration];

                updatePublicProperties(this);
            }
        }


        function decrementEndTime(duration) {

            if(meterTime.End.isAfter(meterTime.MinEnd) && shiftCanGetSmaller()) {

                meterTime.End.add(-timeInterval[duration], 'minutes');
                meterBar.End +=  meterBarInterval[duration];

                updatePublicProperties(this);
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


        function updatePublicProperties(scope) {

            scope.StartTime = meterTime.Start;
            scope.EndTime = meterTime.End;
            scope.MeterTop = meterBar.Start;
            scope.MeterBottom = meterBar.End;
        }   

		return {

			restrict : 'E',
			templateUrl : 'app/views/meterDirectiveMobile.html',
			link : linkFunction,
			scope : {

				start : '=',
				end : '='
			}
		};
	}	

}());