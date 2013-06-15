
// load angular components
require('note');

var angular = require('angularjs')
  , settings = require('settings')
  , angularSettings = require('angular-settings');

// load settings
require('./settings');
var app = require('./angular');

app.addRoute('/', 'noteList', 'NoteList');
app.addRoute('/list/:id', 'noteList', 'NoteList');

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

