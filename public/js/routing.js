var routing = angular.module('myApp.routing', []);
 
routing.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
 
        when('/sign-up', {
                templateUrl: 'login.html',
                controller: 'SignUpCtrl'
            }).
 
            //When we are logged in
        when('/panel', {
            templateUrl: '/partials/panel.html',
            controller: 'PanelCtrl'
        }).
 
        //Otherwise redirect to the login view
        otherwise({
            redirectTo: '/login222'
        });
    }
]);

