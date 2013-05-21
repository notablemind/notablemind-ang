
var expect = require('chai').expect
  , fs = require('fs')
  , org = require('../lib/org');

describe('tolines', function(){
  it('should do null right', function(){
    expect(org.tolines('')).to.eql([]);
  });
  it('should split', function(){
    expect(org.tolines('a\nb')).to.eql(['a', 'b']);
  });
  it('should strip outer', function(){
    expect(org.tolines('\n \ta\nb ')).to.eql(['a', 'b']);
  });
  it('should preserve internal white', function(){
    expect(org.tolines('a\n  b ')).to.eql(['a', '  b']);
  });
  // ? do I want this?
  it('should preserve blank inner lines', function(){
    expect(org.tolines('a\n\nb')).to.eql(['a', '', 'b']);
  });
});

describe('parse_property', function(){
  it('should work', function(){
    expect(org.parse_property(':a: b')).to.eql(['a', 'b']);
  });
  it('should strip outer white', function(){
    expect(org.parse_property('  :a:  b   ')).to.eql(['a', 'b']);
  });
  it('should preserve inner white', function(){
    expect(org.parse_property(' :a: b c  d')).to.eql(['a', 'b c  d']);
  });
  it('should default true', function(){
    expect(org.parse_property(':a:')).to.eql(['a', true]);
  });
  it('should parse false', function(){
    expect(org.parse_property(':a: false')).to.eql(['a', false]);
  });
  it('should parse true', function(){
    expect(org.parse_property(':a: true')).to.eql(['a', true]);
  });
  /**
  it('should parse numbers', function(){
    expect(org.parse_property(':a: 123')).to.eql(['a', 123]);
  });
  it('should parse floats', function(){
    expect(org.parse_property(':a: 1.2')).to.eql(['a', 1.2]);
  });
  it('should parse floats w/ no leading digit', function(){
    expect(org.parse_property(':a: .3')).to.eql(['a', 0.3]);
  });
  **/
});

describe('parse_top', function(){
  it('should strip stars', function(){
    expect(org.parse_top('* One').title).to.equal('One');
    expect(org.parse_top('** One').title).to.equal('One');
    expect(org.parse_top('**** One').title).to.equal('One');
  });
  it('should parse tags', function(){
    expect(org.parse_top('* One :tag:').tags).to.eql(['tag']);
  });
  it('should parse complex tags', function(){
    expect(org.parse_top('** One :tags-1:tag2:people/jamie-sioth:').tags)
      .to.eql(['tags-1', 'tag2', 'people/jamie-sioth']);
  });
  it('should enforce space before tags', function(){
    var res = org.parse_top("** One ':tag:");
    expect(res.tags).to.eql([]);
    expect(res.title).to.equal("One ':tag:");
  });
  it("should not pickup tags if there's a ' at the end", function(){
    var res = org.parse_top("** one :thing:two:'");
    expect(res.tags).to.eql([]);
    expect(res.title).to.eql('one :thing:two:');
  });
  it("should strip off a ' if there's one at the end", function(){
    expect(org.parse_top("** One '").title).to.equal('One ');
  });
  it("should not strip trailing ' before the tags", function(){
    expect(org.parse_top("*** One ' :tag:").title).to.equal("One '");
  });
});
 
describe('starify', function(){
  describe('when given in/out files', function(){
    var files = fs.readdirSync(__dirname + '/org/starify');
    files.forEach(function(fname){
      if (fname.slice(0, 4) !== 'good' || fname.slice(-4) !== '.txt') return;
      it('should parse ' + fname + ' correctly', function(){
        var input = fs.readFileSync(__dirname + '/org/starify/' + fname, {encoding: 'utf8'})
          , parts = input.split('\n-----\n')
          , parsed = org.starify(org.tolines(parts[0]))
          , json = JSON.parse(parts[1]);
        expect(parsed.children).to.eql(json);
      });
    });
  });
  describe('when given bad input', function(){
    var files = fs.readdirSync(__dirname + '/org/starify');
    files.forEach(function(fname){
      if (fname.slice(0, 3) !== 'bad' || fname.slice(-4) !== '.txt') return;
      it('should fail to parse ' + fname, function(){
        var input = fs.readFileSync(__dirname + '/org/starify/' + fname, {encoding: 'utf8'})
          , parse = function(){org.starify(org.tolines(input))};
        expect(parse).to.throw(org.ParseError);
      });
    });
  });
});

 
describe('serialize', function(){
  describe('when given in/out files', function(){
    var files = fs.readdirSync(__dirname + '/org/starify');
    files.forEach(function(fname){
      if (fname.slice(0, 4) !== 'good' || fname.slice(-4) !== '.txt') return;
      it('should serialize ' + fname + ' correctly', function(){
        var input = fs.readFileSync(__dirname + '/org/starify/' + fname, {encoding: 'utf8'})
          , parts = input.split('\n-----\n')
          // , parsed = org.starify(org.tolines(parts[0]))
          , json = JSON.parse(parts[1])
          , serial = org.serialize_all(json);
        try {
          expect(serial).to.eql(parts[0]);
        } catch (e) {
          // if we're off by some whitespace, try parsing back.
          expect(org.starify(org.tolines(serial)).children).to.eql(json);
        }
      });
    });
  });
});
