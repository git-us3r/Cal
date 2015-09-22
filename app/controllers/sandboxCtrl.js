(function(){

    'use strict';

    angular
        .module("Calendar")
        .controller("sandboxCtrl",
                    ['$scope', '$state', '$window', ctrl]);

    function ctrl($scope, $state, $window) {

    	var uid = -1,
            vm = $scope;        

        vm.Data = ['d1', 'd2', 'd3', 'd4'];

        (function makeDataDraggableWithJQuery() {

            angular.element("standAlondeDraggable").ready(function(){

                 $('#standAlondeDraggable').draggable();
            })

            angular.element("Droppable0").ready(function(){

                $('#droppable0').droppable();
            });
                       
        }());


        function getUid() {

            ++uid;
            return uid;
        }

        vm.GetUID = getUid;

    	return vm;
    }

}());