
/*
 * GET home page.
 */

var org = require('org-lite')
  , path = require('path')
  , oid = require('bson').ObjectID;

var genId = function() {
  return new oid().toHexString();
};

var get_all = function () {
  var fname = path.join(path.dirname(__dirname), 'data');
  var objects = new org.OrgFile(fname, true, {genId: genId, time: new Date()});
  if (objects.dirty) {
    objects.save();
  }
  return objects;
};

exports.index = function(req, res){
  res.send(get_all().chunks.children);
};

