
var defaultSettings = require('./defaultSettings')
  , angularSettings = require('angular-settings')
  , settings = require('settings')
  , app = require('./angular');

angularSettings.factory('settings', settings.getSettings());
angularSettings.config('notablemind', {
  name: 'default',
  sub: 'note',
  pages: ['nav']
});
app.controller('Settings', function Settings($scope, $routeParams, db) {
  console.log('Settings init');
});

app.addRoute('/settings', 'settings', 'Settings');

app.run(function($route, $rootScope) {
  socket.emit('load-settings', {});
  socket.on('load-settings', function (json) {
    if (json === false) {
      return socket.emit('save-settings', settings.getSettings().json());
    }
    console.log('loading settings');
    settings.load(json);
    $route.reload();
    $rootScope.$digest();
  });
  socket.on('error', function (data) {
    console.log('Error from server:', data);
  });
});
