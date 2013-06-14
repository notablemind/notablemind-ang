
// load angular components
require('note');

var angular = require('angularjs')
  , settings = require('settings')
  , angularSettings = require('angular-settings');

angularSettings.factory('settings', settings.getSettings());

require('angular-resource');

var app = angular.module('notablemind', ['ngResource', 'note', 'settings'])
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
    }).otherwise({redirectTo: '/settings'});
    $lp.html5Mode(true);
  }]).run(function($location) {
    if (window.client_route)
      $location.path('/' + window.client_route);
  });

app.controller('NoteList', function NoteList($scope, $routeParams, db) {
  $scope.note = {'title': 'All Notes', properties: {type: 'major'}, "children": db};
  window.db=db;
  console.log(db.length);
});

app.factory('db', ['$resource', function($resource) {
  return $resource('/json', {}, {
    'getAll': {method: 'GET', isArray: true}
  }).getAll();
}]);


