(function(){

	'use strict';

	angular.module('Calendar')
	.directive('draggableDirective', ['$swipe', directiveFunction]);

	function directiveFunction($swipe){

		return {

			restrict : 'E',
			templateUrl : 'app/views/draggableDirective.html',
			link : linkFunction,
			scope : {}
		};
	}

	function linkFunction(scope, element, attrs) {

		$(element).draggable({

			containment : '#droppable0',
			snap : '#droppable0',			
			snapMode : "outer",
			zIndex: 100
		});
	}

}());