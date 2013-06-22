
var routes = {};

var app = module.exports = angular.module('notablemind', ['ngResource', 'note', 'settings'])
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

app.factory('db', ['$resource', function($resource) {
  return $resource('/cached.json', {}, {
    'getAll': {method: 'GET', isArray: true}
  }).getAll();
}]);

