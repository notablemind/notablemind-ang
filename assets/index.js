
// client - main entry point

// load angular components
require('note');

var angular = require('angularjs')
  , settings = require('settings')
  , Monitor = require('socketio-monitor')
  , ScopedEvents = require('scoped-events')
  , angularSettings = require('angular-settings');

// load settings
require('./settings');
var app = require('./angular')
  , pages = require('./pages');

function toCamelCase(title) {
  return title[0].toLowerCase() + title.slice(1);
}

Object.keys(pages.routes).forEach(function(path) {
  var ctrl = pages.routes[path];
  app.addRoute(path, toCamelCase(ctrl) + '.html', ctrl);
});

app.controller('NoteList', function NoteList($scope, $routeParams, db) {
  $scope.note = {
    "title": 'All your mind. All your notes.',
    "tags": [],
    "properties": {
      type: 'major',
      top: true
    },
    "children": []
  };
  console.log('getting cached');
  db(function(db) {
    $scope.note.children = db;
  });
  $scope.events = new ScopedEvents()
    .on('title:change', function (evt) {
      console.log('Changed title', evt);
    })
    .on('move:up', function (evt) {
      console.log('moved up', evt);
    });
  
});

var monitor = new Monitor('#connectivity');
monitor.attach(socket);
