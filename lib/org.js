
var util = require('util')
  , path = require('path')
  , fs   = require('fs');

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Error'
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

var newError = function(name, fn, parent) {
  util.inherits(fn, parent || AbstractError)
  fn.prototype.name = name;
  return fn;
};

var BaseParseError = exports.ParseError = newError('Base Parse Error', function(msg, constr) {
  BaseParseError.super_.call(this, msg, this.constructor);
});

var ParseError = newError('Parser Error', function (fname, lineno, msg) {
  msg = 'Parse Error in "' + fname + '" at line ' + lineno + ': ' + msg;
  ParseError.super_.call(this, msg, this.constructor);
}, BaseParseError);

var SSyntaxError = newError('Syntax Error', function (input, msg) {
  msg = 'Parse Error: ' + msg + ' (input "' + input + '")';
  SSyntaxError.super_.call(this, msg, this.constructor);
}, BaseParseError);

var SyntaxError = newError('Syntax Error', function (fname, lineno, msg) {
  msg = 'Parse Error in "' + fname + '" at line ' + lineno + ': ' + msg;
  SyntaxError.super_.call(this, msg, this.constructor);
}, BaseParseError);

/**
 * Parse an ORG file into a JSON object
 */

exports.write = function(children, fname) {
  fs.writeFileSync(serialize_all(children), fname, {encoding: 'utf8'});
};

exports.read = function(fname){
  return exports.parse(fs.readFileSync(fname, {encoding: 'utf8'}), fname);
};

exports.parse = function(text, fname){
  var lines = tolines(text);
  return starify(lines, fname);
};

var tolines = exports.tolines = function(text) {
  text = text.replace(/^\s+/, '').replace(/\s+$/, '');
  if (!text.length) return [];
  return text.split('\n');
};

var parse_property = exports.parse_property = function(line) {
  var line = line.replace(/^\s+/, '').replace(/\s+$/, '').split(' ');
  if (line[0][0] !== ':' || line[0].slice(-1)[0] !== ':')
    throw new SSyntaxError(line, 'need :name: as a property');
  var name = line[0].slice(1, -1);
  var value;
  if (line.length === 1)
    value = true
  else {
    value = line.slice(1).join(' ').replace(/^\s+/, '');
    if (value === 'true')
      value = true;
    else if (value === 'false')
      value = false;
    /**
    else if (value.match(/^\d+$/))
      value = parseInt(value);
    else if (value.match(/^\d*\.\d+$/))
      value = parseFloat(value);
    **/
  }
  return [name, value];
};

var parse_top = exports.parse_top = function(line) {
  line = line.replace(/^\*+ /, '');
  var tags = / (:[^:\s]+)+:$/.exec(line);
  if (tags) {
    line = line.slice(0, tags.index);
    tags = tags[0].slice(2, -1).split(':');
  } else {
    if (line[line.length - 1] == "'") {
      line = line.slice(0, -1);
    }
    tags = [];
  }
  return {"title": line, tags: tags, properties:{}, children:[]};
};

var starify = exports.starify = function(lines, fname, track_ids) {
  if (!lines.length) return [];
  if (lines[0].slice(0, 2) !== '* ')
    throw new SyntaxError(fname, 0, 'Must start with a level 1 item');
  var level = 1
    , curchunk = parse_top(lines[0])
    , chunks = {children: [curchunk], ids:{}, parents:{}, majors: []}
    , parentage = [chunks]
    , stars;
  // TODO consider not tracking these by default...
  // chunks.ids[curchunk.properties.id] = curchunk;
  // chunks.parents[curchunk.properties.id] = chunks;
  for (var i=1; i<lines.length; i++) {
    if (!lines[i].length) continue;
    if (lines[i][0] !== '*') {
      if (!lines[i].match(/^\s*:PROPERTIES:\s*$/))
        throw new SyntaxError(fname, i, 'Expected properties, got ' + lines[i]);
      for (++i; i<lines.length; i++) {
        if (lines[i].match(/^\s*:END:\s*$/)) {
          i+=1;
          break;
        }
        var nv = parse_property(lines[i]);
        curchunk.properties[nv[0]] = nv[1];
      }
    }
    chunks.ids[curchunk.properties.id] = curchunk;
    chunks.parents[curchunk.properties.id] = parentage[parentage.length-1];
    if (curchunk.properties.type === 'major') {
      chunks.majors.push(curchunk.properties.slug);
    }
    if (i >= lines.length)
      break;
    stars = lines[i].match(/^\*+ /);
    if (!stars)
      throw new SyntaxError(fname, i, 'Expected an item');
    stars = stars[0].length-1;
    if (stars > level + 1)
      throw new SyntaxError(fname, i, 'Can only go up one level');
    if (stars > level) {
      parentage.push(curchunk);
    } else while (stars < level) {
      level -= 1;
      parentage.pop();
    }
    curchunk = parse_top(lines[i]);
    parentage[parentage.length-1].children.push(curchunk);
    level = stars;
  }
  return chunks;
};
  
var addstar = function(line){ return '*' + line; };

var serialize_top = exports.serialize_top = function(item){
  var top = '* ' + item.title;
  if (item.tags.length) {
    top += ' :' + item.tags.join(':') + ':';
  } else {
    top += "'";
  }
  return top;
};

var serialize_properties = exports.serialize_properties = function(obj) {
  lines = '';
  Object.keys(obj).forEach(function(key){
    lines += '  :' + key + ': ' + obj[key] + '\n';
  });
  if (lines.length === 0) return '';
  return '\n  :PROPERTIES:\n' + lines + '  :END:';
};

var serialize = exports.serialize = function(item){
  var top = serialize_top(item);
  var properties = serialize_properties(item.properties);
  var lines = [top + properties];
  item.children.forEach(function(child){
    lines = lines.concat(serialize(child).map(addstar));
  });
  return lines;
};

var serialize_all = exports.serialize_all = function(items) {
  return items.map(function(child){
    return serialize(child).join('\n')
  }).join('\n');
};

exports.write = function(fname, children){
  var text = serialize_all(children); //'\n'.join(children.map(serialize));
  fs.writeFileSync(fname, text);
};

var make_slug = exports.make_slug = function(title, slugs) {
  var parts = title.toLowerCase().replace(/([^\w\s]|_)/g, '').split(/\s+/);
  for (var i=3; i<parts.length+1; i++) {
    if (slugs.indexOf(parts.slice(0, i).join('-')) === -1)
      break;
  }
  return parts.slice(0, i).join('-');
};

var convert_to_major = exports.convert_to_major = function(chunk, slugs) {
  return {
    title: chunk.title,
    tags: chunk.tags,
    properties: {
      type: 'major',
      slug: make_slug(chunk.title, slugs),
      id: chunk.properties.id
    },
    children: []
  };
};

var find_majors = function(children) {
  return tree_type_filter(children, 'major');
};

var find_attachments = exports.find_attachments = function(children) {
  return tree_type_filter(children, 'file');
};

var tree_type_filter = function(children, type){
  return tree_filter(children, function(child){
    return child.properties.type === type;
  });
};

var tree_filter = exports.tree_filter = function(children, test){
  var found = [];
  for (var i=0; i<children.length; i++) {
    if (test(children[i])) found.push(children[i]);
    found = found.concat(tree_filter(children[i].children, test));
  }
  return found;
};

var index_name = exports.index_name = 'index.org'

var promote = exports.promote = function(ipath, oid){
  var fname = path.join(ipath, index_name);
  if (!fs.existsSync(fname))
    throw new Error('Invalid item path: ' + ipath);
  var text = fs.readFileSync(fname, {encoding: 'utf8'});
  var chunks = exports.parse(text, fname);
  if (typeof(chunks.ids[oid]) === 'undefined') {
    throw new Error('Object with oid ' + oid + ' not found in ' + fname +
                    ': ' + Object.keys(chunks.ids).length + ' key found (' + Object.keys(chunks.ids) + ')');
  }
  /** was going to use this to get a unique slug...but just check in the index.org
  var curdirs = fs.readdirSync(ipath).filter(function(name){
    return fs.statSync(path.join(ipath, name)).isDirectory();
  });
  **/
  var item = chunks.ids[oid];
  var parent = chunks.parents[oid];
  var children = item.children;
  var major = convert_to_major(item, chunks.majors);
  // ensure unique slug
  if (fs.existsSync(path.join(ipath, major.properties.slug))) {
    var i = 1;
    while (fs.existsSync(path.join(ipath, major.properties.slug + '-' + i))) {
      i += 1;
    }
    major.properties.slug += '-' + i;
  }
  // make directory slug/
  fs.mkdirSync(path.join(ipath, major.properties.slug));
  // move all attached files to new directory
  var attachments = find_attachments(children);
  for (var i=0; i<attachments.length; i++) {
    // TODO: make this a batch
    fs.renameSync(path.join(ipath, attachments[i].properties.name),
                  path.join(ipath, major.properties.slug, attachments[i].properties.name));
  }
  // move any child major item directories to the new directory
  var child_majors = find_majors(children);
  child_majors.forEach(function(chunk){
    fs.renameSync(path.join(ipath, chunk.properties.slug),
                  path.join(ipath, major.properties.slug, chunk.properties.slug));
  });
  // write children to slug/_index.org file
  exports.write(path.join(ipath, major.properties.slug, index_name), children);
  // replace the item with its major counterpart
  chunks.parents[oid].children[chunks.parents[oid].children.indexOf(item)] = major;
  // rewrite _index.org
  exports.write(path.join(ipath, index_name), chunks.children);
};

exports.demote = 0;
