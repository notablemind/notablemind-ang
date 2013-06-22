#!/usr/bin/env node

var jade = require('jade')
  , fs = require('fs')
  , path = require('path')
  , pages = require('./assets/pages');

var infile = path.join(__dirname, 'assets', 'jade', 'index.jade')
  , outfile = path.join(__dirname, 'static', 'index.html');

fs.readFile(infile, function (err, data) {
  if (err) throw err;
  var fn = jade.compile(data.toString('utf8'), {
    filename: infile,
    pretty: true
  });
  fs.writeFile(outfile, fn({ nav: pages.nav }), function (err) {
    if (err) throw err;
    console.log('Compiled');
  });
});

