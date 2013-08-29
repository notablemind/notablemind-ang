
var org = require('org-lite')
  , path = require('path')
  , oid = require('bson').ObjectID
  , debug = require('debug')('nm:listen');

function genId() {
  return new oid().toHexString();
}

function dumpDir(basedir) {
  console.log(org);
  var objects = new org.OrgFile(basedir, true, {genId: genId, time: new Date()});
  if (objects.dirty) {
    objects.save();
  }
  return objects;
}

module.exports = function listen(socket) {
  var db;
  socket.on('dump', function (dir) {
    dir = dir || process.env.NOTABLEMIND_HOME || path.join(process.env.HOME, '.notablemind');
    debug('dump', dir);
    db = dumpDir(dir);
    socket.emit('dump', db.chunks.children);
  });

  // path, note
  socket.on('change', function (data) {
    debug('change', data);
    db.modify(data.note.properties.id, data.note);
    db.save();
  });

  socket.on('move', function (data) {
    debug('move', data);
    db.move(data.id, data.oldpid, data.pid, data.index);
    db.save();
  });

  // id, pid
  socket.on('delete', function (data) {
    debug('delete', data);
    db.remove(data.id, data.pid);
    db.save();
  });

  socket.on('create', function (data) {
    debug('create', data);
    db.add(data.note, data.pid, data.index);
    db.save();
  });
};
