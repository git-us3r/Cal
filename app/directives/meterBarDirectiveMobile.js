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
			lastXCoordinate = null,
			swipeCancelCoordinates = null,
			edgeBeingDragged = null,
			localScope = {
				start : '=',
				end : '='
			};


		function linkFunction(scope, element, attrs) {

			var jQmeterWrapper = element.find('#meterWrapper_mobile');

			localScope = scope;

			setupMeterTimeObjectProperties();

			// Bind the onmousewheel event of the meterWrapper element to the processMeterScroll function
			bindScrollingToWrapper(jQmeterWrapper)	       	

			setupMeterBarObjectProperties(jQmeterWrapper[0]);

			setupPublicScopeProperties();		

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
			meterTime.StartOfDay = moment({H:7, m:0});
			meterTime.EndOfDay = moment({H:0, h:0});											//.. of the next day.
		}


		function initializeMeterBarStart(meterWrapper) {

			var startOfDayInMinutes = meterTime.StartOfDay.hours() * 60 + meterTime.StartOfDay.minutes(),
				startOfShiftInMinutes = meterTime.Start.hours() * 60 + meterTime.Start.minutes(),
				minutesFromStartOfDay = startOfShiftInMinutes - startOfDayInMinutes,
				intervalsFromStartOfDay = minutesFromStartOfDay / timeInterval.Short,
				meterBarStartLocation = intervalsFromStartOfDay * meterBarInterval.Short;

			return meterBarStartLocation;
		}	


		function initializeMeterBarEnd(meterWrapper) {

			var endOfDayInMinutes = meterTime.EndOfDay.hours() * 60 + meterTime.EndOfDay.minutes(),
				endOfShiftInMinutes = (24 - meterTime.End.hours()) * 60 + meterTime.End.minutes(),
				minutesFromEndOfDay = Math.abs(endOfDayInMinutes - endOfShiftInMinutes),										// because the day ends at 12 a,
				intervalsFromEndOfDay = minutesFromEndOfDay / timeInterval.Short,
				meterBarEndLocation = intervalsFromEndOfDay * meterBarInterval.Short;

			return meterBarEndLocation;
		}


		function setupMeterBarObjectProperties(meterWrapper) {

			var workDayDuration = 17,
				centerOffset = 30;
			
			meterBar.BoundingClientRect = meterWrapper.getBoundingClientRect();
			meterBar.TopHalf = (meterBar.BoundingClientRect.width / 2) - 10;					// the middle aint what it seems
			meterBar.BottomHalf = (meterBar.BoundingClientRect.width / 2) + 10;					// the bottom section starts 10px below the 'middle'

			meterBarInterval.Short = meterBar.BoundingClientRect.width / (workDayDuration * 4); // map the height to 15-min intervals
			meterBarInterval.Long = meterBar.BoundingClientRect.width / workDayDuration;		// map the height to 1-hour intervals			

			meterBar.Start = initializeMeterBarStart(meterWrapper);
			meterBar.End = initializeMeterBarEnd(meterWrapper);

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

			$swipe.bind(wrapper, swipeHandlerObject, ['touch']);

			// Now, it can be safely bound.
			wrapper.on('mousewheel', processMeterScroll);
		}


		function setEdgeBeingDragged(clientX) {

			var distanceFromStart,
				distanceFromEnd;

			distanceFromStart = Math.abs(clientX - meterBar.Start);

			distanceFromEnd = (meterBar.End > 0) ? Math.abs(clientX - meterBar.End) : Math.abs(clientX - meterBar.BoundingClientRect.right);			

			edgeBeingDragged = distanceFromStart < distanceFromEnd ? 'Start' : 'End';

		}


		function swipeStart(coords) {

			swipeStartCoordinates = coords;
			lastXCoordinate = coords.x;
		}


		function swipeMove(coords, jsEvent) {

			localScope.$apply(function(){

				var startClientX,
					shortInterval = meterBarInterval.Short * 17 * 4 / meterBar.BoundingClientRect.width;

				swipeMoveCoordinates = coords;

				swipeMoveDelta = Math.abs(swipeMoveCoordinates.x - swipeStartCoordinates.x);

				startClientX = swipeMoveCoordinates.x - meterBar.BoundingClientRect.left;

				if(!edgeBeingDragged) {

					setEdgeBeingDragged(startClientX);
				}

				if(swipeMoveDelta >= shortInterval) {
				 
					if(edgeBeingDragged === 'Start'){
						
						if(swipeMoveCoordinates.x > lastXCoordinate) {

							incrementStartTime('Short');
							// meterBar[edgeBeingDragged] = Math.floor(startBarLocation);
						}
						else {

							decrementStartTime('Short');
						}
					}
					else {

						if(swipeMoveCoordinates.x > lastXCoordinate) {

							incrementEndTime('Short');
						}
						else {

							decrementEndTime('Short');
						}
					}
				
				}			

				updatePublicProperties();

				lastXCoordinate = swipeMoveCoordinates.x;
			});
		}


		function swipeEnd(coords) {

			edgeBeingDragged = null;
		}


		function swipeCancel(coords) {

			edgeBeingDragged = null;
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