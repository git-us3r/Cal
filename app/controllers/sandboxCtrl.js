(function(){

    'use strict';

    angular
        .module("Calendar")
        .controller("sandboxCtrl",
                    ['$scope', '$state', '$window', ctrl]);

    function ctrl($scope, $state, $window) {

    	var vm = this,
            minHeight = 500,
            minWidth = 1205;

        (function init(){

            window.onresize = function() {

                $scope.$apply(function(){

                    updateDimensions();
                });   
            };

            updateDimensions();

        }());


        function updateDimensions() {

            vm.VisibleHeight = $window.innerHeight;        
            vm.VisibleWidth = $window.innerWidth;

            if(vm.VisibleWidth < minWidth) {

                vm.CurrentView = 'smallView';
            } 
            else {

                vm.CurrentView = 'largeView';
            }
        }


    	return vm;
    }

}());