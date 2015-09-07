(function(){

	'use strict';

	angular.module('Calendar')
	.directive('meterBarDirectiveMobile', ['$swipe', directiveFunction]);

	function directiveFunction($swipe){

		var meterBar = {

                Start : null,
                End : null,
                Width : null,
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
            swipeStartCoordinates = null,
            swipeEndCoordinates = null,
            swipeMoveCoordinates = null,
            swipeMoveDelta = null,
            swipeCancelCoordinates = null,
            localScope = {
                start : '=',
                end : '='
            };


		function linkFunction(scope, element, attrs) {

	       	var jQmeterWrapper = element.find('#meterWrapper_mobile');

            localScope = scope;

	       	// Bind the onmousewheel event of the meterWrapper element to the processMeterScroll function
	       	bindScrollingToWrapper(jQmeterWrapper)	       	

			setupMeterBarObjectProperties(jQmeterWrapper[0]);

            setupPublicScopeProperties();		

            setupMeterTimeObjectProperties();

	        updatePublicProperties();

            // Make the whole directive unselectable
            element.on('selectstart', function(){ return false; });            
		}


		// Private Functions

        function setupPublicScopeProperties() {

            // Setup scope public properties
            localScope.IncrementStartTime = incrementStartTime;
            localScope.DecrementStartTime = decrementStartTime;
            localScope.IncrementEndTime = incrementEndTime;
            localScope.DecrementEndTime = decrementEndTime;
            localScope.StartTime = localScope.start;
            localScope.EndTime = localScope.end;
        }
       

		function setupMeterTimeObjectProperties () {
			
			meterTime.Start = localScope.start;
            meterTime.End = localScope.end;
		}


		function setupMeterBarObjectProperties(meterWrapper) {

			var workDayDuration = 17,
				centerOffset = 30;


			meterBar.Start = 0;
			meterBar.End = 0;
			
            meterBar.BoundingClientRect = meterWrapper.getBoundingClientRect();
            meterBar.TopHalf = (meterBar.BoundingClientRect.width / 2) - 10;					// the middle aint what it seems
			meterBar.BottomHalf = (meterBar.BoundingClientRect.width / 2) + 10;					// the bottom section starts 10px below the 'middle'



			meterBarInterval.Short = meterBar.BoundingClientRect.width / (workDayDuration * 4); // map the height to 15-min intervals
			meterBarInterval.Long = meterBar.BoundingClientRect.width / workDayDuration;		// map the height to 1-hour intervals			

		}


        function getSwipeHandlerObject() {

            var swipeHandlerObject = {};
            swipeHandlerObject.start = swipeStart;
            swipeHandlerObject.move = swipeMove;
            swipeHandlerObject.end = swipeEnd;
            swipeHandlerObject.cancel = swipeCancel;

            return swipeHandlerObject;

        }


        function processMeterScroll(scrollEvent) {

                localScope.$apply(function () {

                    var scrollCordinates = {x: scrollEvent.offsetX, y: scrollEvent.offsetY};

                    if(scrollCordinates.x < meterBar.TopHalf) {

                        // scroll on top-half: modify start time
                        if(scrollEvent.originalEvent.deltaY > 0) {

                            incrementStartTime('Short');
                        }
                        else {

                            decrementStartTime('Short');   
                        }
                    }
                    else if (scrollCordinates.x > meterBar.BottomHalf) {

                        // scroll on bottom-half: modify start time
                        if(scrollEvent.originalEvent.deltaY > 0) {

                            incrementEndTime('Short');
                        }
                        else {

                            decrementEndTime('Short');
                        }
                    }
                });
        }


        function bindScrollingToWrapper (wrapper) {

            var swipeHandlerObject = getSwipeHandlerObject();

      		$swipe.bind(wrapper, swipeHandlerObject);

            // Now, it can be safely bound.
            wrapper.on('mousewheel', processMeterScroll);
        }


        function swipeStart(coords) {

            swipeStartCoordinates = coords;
        }


        function swipeMove(coords, jsEvent) {

            localScope.$apply(function(){

                var clientX;

                swipeMoveCoordinates = coords;

                swipeMoveDelta = swipeMoveCoordinates.x - swipeStartCoordinates.x;

                clientX = swipeMoveCoordinates.x - meterBar.BoundingClientRect.left;

                if(clientX < meterBar.BottomHalf) {

                    meterBar.Start = meterBarInterval.Short * (clientX * 17 * 4 / meterBar.BoundingClientRect.width);
                }

                updatePublicProperties();
            });
        }


        function swipeEnd(coords) {

            // TODO
        }


        function swipeCancel(coords) {

            // TODO
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

            localScope.StartTime = meterTime.Start;
            localScope.EndTime = meterTime.End;
            localScope.MeterTop = meterBar.Start;
            localScope.MeterBottom = meterBar.End;
        }   

		return {

			restrict : 'E',
			templateUrl : 'app/views/meterDirectiveMobile.html',
			link : linkFunction,
			scope : localScope
		};
	}	

}());