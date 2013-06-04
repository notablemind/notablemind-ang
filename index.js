
var loader = require('angular-loader');

// load angular components
loader('note', require('note'));

var angular = require('angularjs');

var app = angular.module('notablemind', ['notes'])
  .config(['$routeProvider', '$locationProvider', function($rp, $lp) {
    $rp.when('/', {
      templateUrl: 'noteList.html',
      controller: 'NoteList'
    }).when('/list/:id', {
      templateUrl: 'noteList.html',
      controller: 'NoteList'
    }).when('/settings', {
      templateUrl: 'settings.html',
      controller: 'Settings'
    });
    $lp.html5Mode(true);
  }]);

app.controller('NoteList', function NoteList($scope, $http) {
  $scope.notes = [];
});


