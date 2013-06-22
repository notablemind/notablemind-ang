
var path = require('path')
  , settings_fname = path.join(__dirname, '..', 'data', 'settings.json')
  , memmify = require('memmify')
  , cache = new memmify.JsonCache();

// sends the json back, or false if the file doesn't exist
var load = function (next) {
  cache.load(settings_fname, function (err, data) {
    if (err) {
      // file doesn't exist yet
      if (err.code === 'ENOENT') return next(null, false);
      return next(err);
    }
    next(null, data);
  });
};

var save = cache.save.bind(cache, settings_fname);

var saveOne = function (name, value, next) {
  cache.load(settings_fname, function (err, data) {
    if (err) return next(err);
    data[name] = value;
    cache.save(settings_fname, data, next);
  });
};

var dump = function (data, next) {
  cache.load(settings_fname, function (err, json) {
    if (err) return next(err);
    data.changes.forEach(function(item) {
      json[item.name] = item.value;
    });
    cache.save(settings_fname, json, next.bind(null, json));
  });
};

exports.attach = function (socket) {

  socket.on('settings:load', function (data) {
    load(function (err, json) {
      if (err)
        return socket.emit('error', {cmd: 'settings:load', error: err});
      socket.emit('settings:load', json);
    });
  });

  socket.on('settings:dump', function (data) {
    dump(data, function (err, json) {
      if (err) socket.emit('error', {cmd: 'settings:load', error: err});
      socket.emit('settings:load', json);
    });
  });

  socket.on('settings:save', function (data) {
    save(data, function (err) {
      if (err)
        return socket.emit('error', {cmd: 'settings:save', error: err});
      // TODO: do I want to send a pingback?
    });
  });

  socket.on('settings:change', function (data) {
    saveOne(data.name, data.value, function (err) {
      if (err)
        return socket.emit('error', {cmd: 'settings:change', error: err});
    });
  });

};
