
var path = require('path')
  ,settings_fname = path.join(__dirname, '..', 'data', 'settings.json')
  , memmify = require('memmify')
  , cache = new memmify.JsonCache();

// sends the json back, or false if the file doesn't exist
exports.load = function (next) {
  cache.load(settings_fname, function (err, data) {
    if (err) {
      // file doesn't exist yet
      if (err.code === 'ENOENT') return next(null, false);
      return next(err);
    }
    next(null, data);
  });
};

exports.save = cache.save.bind(cache, settings_fname);
exports.saveOne = function (name, value, next) {
  cache.load(settings_fname, function (err, data) {
    if (err) return next(err);
    data[name] = value;
    cache.save(settings_fname, data, next);
  });
};

