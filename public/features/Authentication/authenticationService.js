'use strict';
  
var app = angular.module('authenticationService', [] );

app.run(function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (ev, next, curr) {
        //$location.path("/login");
        console.log("redirect from auth.service");
    });
    console.log('redirect from AService');
    // $location.path("/login");
});

app.factory('AuthenticationService',
    function ($http, $rootScope, $timeout, $cookieStore) {
        var service = {};
 
        service.Login = function (username, password, callback) {
 
            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            $timeout(function(){
                var response = { success: username === 'test' && password === 'test' };
                if(!response.success) {
                    response.message = 'Username or password is incorrect';
                }
                callback(response);
            }, 1000);
 
 
            /* Use this for real authentication
             ----------------------------------------------*/
            //$http.post('/api/authenticate', { username: username, password: password })
            //    .success(function (response) {
            //        callback(response);
            //    });
 
        };
  
        service.SetCredentials = function (username, password) {
            var authdata = 'user:pass'; // Base64.encode(username + ':' + password);
  
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata
                }
            };
  
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
  
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        /* -- Custom Services -- */

        $rootScope.loggedIn = function() {
            if ($rootScope.globals && $rootScope.globals.currentUser) {
                return true;
            }
            return false;
        };

        $rootScope.getUsername = function () {
            if ($rootScope.loggedIn())
                return $rootScope.globals.currentUser.username;
            return 'unknown';
        };

        return service;
});
