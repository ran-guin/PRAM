( function () {
    'use strict';

    var app = angular.module('myApp', [ 
        'ngResource',
        'ngRoute',
        'ngCookies',
        'Nto1Factory',
        'authenticationService',
        'angularjs-dropdown-multiselect',
        'ui.bootstrap',
    ])

    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
 
    $routeProvider
        .when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'login.html'
        })
  
        .when('/divert', {
            controller: 'OrderCtrl',
            templateUrl: 'login.html'
        })
  
}]);
  
app.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }
 
        console.log('redirect if required');

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                console.log('redirect to login');
                // $location.absUrl('login').replace();
            }
        });
    }]);

})();
