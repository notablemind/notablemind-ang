
var OrgFile = require('org-lite')
  , path = require('path')
  , oid = require('bson').ObjectID
  , debug = require('debug')('nm:listen');

function genId() {
  return new oid().toHexString();
}

function dumpDir(basedir) {
  var objects = new OrgFile(basedir, true, {genId: genId, time: new Date()});
  if (objects.dirty) {
    objects.save();
  }
  return objects;
}

module.exports = function listen(socket) {
  var db;
  function getDb() {
    var dir = process.env.NOTABLEMIND_HOME || path.join(process.env.HOME, '.notablemind');
    debug('dump', dir);
    db = dumpDir(dir);
  }
  socket.on('dump', function () {
    if (!db) getDb();
    socket.emit('dump', db.chunks.children);
  });

  // path, note
  socket.on('change', function (data) {
    if (!db) getDb();
    debug('change', data);
    db.modify(data.note.properties.id, data.note);
    db.save();
  });

  socket.on('move', function (data) {
    debug('move', data);
    if (!db) getDb();
    db.move(data.id, data.oldpid, data.pid, data.index);
    db.save();
  });

  // id, pid
  socket.on('delete', function (data) {
    if (!db) getDb();
    debug('delete', data);
    db.remove(data.id, data.pid);
    db.save();
  });

  socket.on('create', function (data) {
    if (!db) getDb();
    debug('create', data);
    db.add(data.note, data.pid, data.index);
    db.save();
  });
};
