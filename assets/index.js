
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

// TODO: use shoe.js
app.factory('socket', function () {
  return io.connect(location.protocol + '//' + location.hostname);
});

app.factory('events', function () {
  var Emitter = require('emitter');
  return new Emitter();
});

app.factory('sync', ['socket', 'events', function (socket, events) {
  var Sync = require('sync-notes');
  return new Sync(socket, events);
}]);

app.run(['sync', 'socket', 'settings.sync', function (sync, socket, settings) {
  var monitor = new Monitor('#connectivity');
  monitor.attach(socket);
}]);

app.controller('NoteList', ['$scope', '$routeParams', 'events', 'sync', function ($scope, $routeParams, events, sync) {
  $scope.note = {
    "title": 'All your mind. All your notes.',
    "tags": [],
    "properties": {
      type: 'major',
      top: true
    },
    "children": []
  };
  function onChange(db) {
    if (db) {
      $scope.db = db;
      $scope.note.children = db;
    }
    $scope.$digest();
  }
  events.on('db:changed', onChange);
  $scope.$on('$destroy', function () {
    events.off('db:changed', onChange);
  });
  if (sync.db) {
    $scope.db = sync.db;
    $scope.note.children = sync.db;
  }
}]);
