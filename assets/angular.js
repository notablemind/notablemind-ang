
var routes = {}
  , request = require('superagent')

  , note = require('note')
  , angularSettings = require('angular-settings');

var app = module.exports = angular.module('notablemind', ['ngResource', note.name, angularSettings.mod.name])
  .config(['$routeProvider', '$locationProvider', function(route, location) {
    Object.keys(routes).forEach(function (path) {
      route.when(path, routes[path]);
    });
    route.otherwise({redirectTo: '/settings'});
    location.html5Mode(true);
  }]).run(function($location) {
    if (window.client_route)
      $location.path('/' + window.client_route);
    console.log('run1');
  });

app.addRoute = function (path, tpl, ctrl) {
  routes[path] = {
    templateUrl: tpl,
    controller: ctrl
  };
};

require('angular-resource');

function promise(getter, next) {
  var item = null, waiting = [];
  getter(function (err, res) {
    if (err) return next(err);
    item = res.body;
    waiting.forEach(function (fn) {
      fn(item);
    });
    next(null, item);
  });
  return function (fn) {
    if (item !== null) return fn(item);
    waiting.push(fn);
  };
}

/*
app.factory('db', function() {
  var req = request.get('/cached.json');
  return promise(req.end.bind(req), function (err, data) {
    if (err) {
      console.log('Error getting cached stuff', err);
    }
  });
});
*/

