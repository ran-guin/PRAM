'use strict';
  
var app = angular.module('loginCtrl',[]);
  
app.controller('LoginCtrl',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
        // reset login status
        AuthenticationService.ClearCredentials();
  
        $scope.login = function () {
            console.log('attempting login');

            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function(response) {
                if(response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $location.path('/');
                } else {
                    $scope.username = '';
                    $scope.password = '';
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
    }]);
