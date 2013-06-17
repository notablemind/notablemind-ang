
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , http = require('http')
  , path = require('path')
  , fs = require('fs')

  , routes = require('./routes')
  , settings = require('./routes/settings')
  , org = require('org-lite');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/static'));

// most things go through here
app.use(express.static(path.join(__dirname, 'static')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/json', routes.index);
// app.get('/users', user.list);
var index = function(req, res) {
  res.send(fs.readFileSync(path.join(__dirname, 'static', 'index.html')).toString('utf8'));
}
app.get('/settings', index);
app.get('/config', index);
app.get('/', index);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('load-settings', function (data) {
    settings.load(function (err, json) {
      if (err) return socket.emit('error', {cmd: 'load-settings', error: err});
      socket.emit('load-settings', json);
    });
  });
  socket.on('save-settings', function (data) {
    settings.save(data, function (err) {
      if (err) return socket.emit('error', {cmd: 'save-settings', error: err});
    });
  });
  socket.on('setting-change', function (data) {
    settings.saveOne(data.name, data.value, function (err) {
      if (err) return socket.emit('error', {cmd: 'setting-change', error: err});
    });
  });
});

