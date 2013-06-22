
// client - main entry point

// load angular components
require('note');

var angular = require('angularjs')
  , settings = require('settings')
  , Monitor = require('socketio-monitor')
  , angularSettings = require('angular-settings');

// load settings
require('./settings');
var app = require('./angular')
  , pages = require('./pages');

function toCamelCase(title) {
  return title[0].toLowerCase() + title.slice(1);
};

Object.keys(pages.routes).forEach(function(path) {
  var ctrl = pages.routes[path];
  app.addRoute(path, toCamelCase(ctrl) + '.html', ctrl);
});

app.controller('NoteList', function NoteList($scope, $routeParams, db) {
  $scope.note = {
    "title": 'All your mind. All your notes.',
    "tags": [],
    "properties": {
      type: 'major'
    },
    "children": db
  };
});

var monitor = new Monitor('#connectivity');
monitor.attach(socket);
