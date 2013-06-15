
var loader = require('angular-loader');
var defaultSettings = require('./settings');
var settings = require('settings');

// load angular components
loader('note', require('note'));
loader('settingsmanager', settings);

var angular = require('angularjs');
require('angular-resource');

var settingsShortcut = require('settings-shortcut');
settings.register('keyboard-shortcut', settingsShortcut);

var app = angular.module('notablemind', ['ngResource', 'note', 'settingsmanager'])
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
  $scope.note = {"title": 'All your mind. All your notes.',
                 "tags": [],
                 "properties": {
                   type: 'major'
                 },
                 "children": db};
  window.db=db;
  console.log(db.length);
});

app.controller('Settings', function Settings($scope, $routeParams, settings) {
  $scope.settings = settings;
});

app.factory('db', ['$resource', function($resource) {
  return $resource('/static.json', {}, {
    'getAll': {method: 'GET', isArray: true}
  }).getAll();
}]);

app.factory('settings', ['$resource', function($resource) {
  // future: figure out how to load this async...and have it work right
  return new settings.SettingsManager(defaultSettings);
}]);
  


