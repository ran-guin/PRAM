'use strict';
var app = angular.module('myApp');

app.controller('HomeCtrl', 
    ['$scope', 
    function ($scope) {

	console.log('loaded Home Controller');

    $scope.getPermissions = function (response) {
        $scope.permissions = response;
    }
    
    $scope.permissions   = $http.get('/permissions')
                     .success($scope.getPermissions);

}]);
