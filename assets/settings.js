
// client - settings management

var defaultSettings = require('./defaultSettings')
  , angularSettings = require('angular-settings')
  , settings = require('settings')()
  , app = require('./angular');

angularSettings.config('notablemind', 'default', {
  title: 'Navigation',
  name: 'nav',
  settings: ['note.nav.*']
});

app.controller('Settings', function Settings($scope, $routeParams) {
  console.log('Settings init');
});

app.factory('settings.sync', ['$route', '$rootScope', 'socket', function ($route, $rootScope, socket) {
  socket.on('connect', function () {
    socket.emit('settings:load', {});
  });
  socket.on('settings:load', function (json) {
    if (json === false) {
      return socket.emit('settings:save', settings.getSettings().json());
    }
    console.log('loading settings');
    settings.load(json);
    $route.reload();
    $rootScope.$digest();
  });
  socket.on('error', function (data) {
    console.log('Error from server:', data);
  });
}]);
