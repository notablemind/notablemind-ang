
console.log(require('note'));
var loader = require('angular-loader');

// load angular components
var angular = [
  'note',
];
loader(require, angular);

