(function(){

    'use strict';

    var app = angular.module("Calendar", ["ui.router", "ngRoute", "ngAnimate"]);

    app.config(["$stateProvider", "$urlRouterProvider",
        function($stateProvider, $urlRouterProvider){

            $urlRouterProvider.otherwise("landing");

            $stateProvider
                .state("landing", {
                    url: "/landing",
                    templateUrl: "app/views/landing.html",
                    controller: "landingViewCtrl as vm"
                })
                .state("calendar", {
                    url: "/calendar",
                    templateUrl: "app/views/calendar.html",
                    controller: "calendarViewCtrl as vm"
                })
                .state("sandbox", {
                    url: "/sandbox",
                    templateUrl: "app/views/sandbox.html",
                    controller: "sandboxCtrl as vm"
                })
                .state("taskCard", {
                    url: "/taskCard",
                    templateUrl: "app/views/taskCard.html",
                    controller: "taskCardCtrl as vm"
                });
        }]
    );

}());