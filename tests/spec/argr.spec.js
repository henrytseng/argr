'use strict';

var assert = require("assert");

describe('Argr', function(){

  describe('#init()', function(){
    it('Should initialize arguments without error', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      Argr().init('/usr/local/bin/node hello tests/data/config.json'.split(' '));

      done();
    });
  });

  describe('#option()', function(){
    it('Should set/get definition with only one short/long param', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr();

      // Set
      args.option('p', 'Lorem ipsum', 'abc');

      // Get
      var optDef = args.option('p');
      assert.equal(optDef.value(), 'abc');
      assert.equal(optDef.description, 'Lorem ipsum');

      done();
    });

    it('Should get non-existing definition as undefined', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr();

      // Get
      var optDef = args.option('p');
      assert.ok(typeof optDef === 'undefined');

      done();
    });

    it('Should accept short and long parameter names', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr();

      // Set
      args.option(['p', 'longParam'], 'Lorem ipsum', 'abc');

      // Get short
      var shortDef = args.option('p');
      assert.equal(shortDef.value(), 'abc');
      assert.equal(shortDef.description, 'Lorem ipsum');

      // Get long
      var longDef = args.option('longParam');
      assert.equal(longDef.value(), 'abc');
      assert.equal(longDef.description, 'Lorem ipsum');

      done();
    });
  });

  describe('#get()', function(){
    it('Should get default values according to definition default', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr('/usr/local/bin/node hello -k'.split(' '))
        .option(['o', 'open'], 'Open a file', 'myfile.m');

      // Default value
      assert.equal(args.get('o'), 'myfile.m');

      // Non-existing
      assert.equal(args.get('p'), false);

      done();
    });

    it('Should get arguments with short combined parameters', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr('/usr/local/bin/node hello skipped-value -fbqKx ignore'.split(' '))
        .option(['f', 'foo'], 'Sed ut')
        .option(['q', 'quo'], 'Lorem ipsum')
        .option(['K', 'kolor'], 'Ipsum')
        .option(['u', 'wasNotProvided'], 'Not defined');

      // Provided
      assert.equal(args.get('f'), true);
      assert.equal(args.get('foo'), true);

      // Not defined but provided
      assert.equal(args.get('b'), true);

      // Was not provided
      assert.equal(args.get('u'), false);
      assert.equal(args.get('wasNotProvided'), false);

      done();
    });

    it('Should ignore parameters in signatures even if they look like arguments', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      // Create an instance of Argr
      var argr = Argr('/usr/local/bin/node hello skipped-value -abc -g -50.2 232 -s=abc-def ignored'.split(' '))

        // Define the options available
        .option(['a', 'option_a'], 'Option A')
        .option(['b', 'option_b'], 'Option B')

        // Define an option with complex syntax
        .option(['g', 'geocoord'], 'A geocoordinate', null, ['lat', 'lng'])

        // Define an option with compact syntax
        .option(['s', 'jam'], 'Peanut', null, ['butter']);

      // Combined parameters
      assert.equal(argr.get('a'), true);
      assert.equal(argr.get('b'), true);

      // Undefined parameters are not ignored
      assert.equal(argr.get('c'), true);

      // Complex syntax
      assert.equal(argr.get('g').lat, '-50.2');
      assert.equal(argr.get('g').lng, '232');

      // Compact syntax
      assert.equal(argr.get('s').butter, 'abc-def');

      done();
    });

    it('Should allow use of string syntax instead of process.argv', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      // Create an instance of Argr
      var argr = Argr('/usr/local/bin/node hello skipped-value -abc -g -50.2 232 -s=abc-def ignored')

        // Define the options available
        .option(['a', 'option_a'], 'Option A')
        .option(['b', 'option_b'], 'Option B')

        // Define an option with complex syntax
        .option(['g', 'geocoord'], 'A geocoordinate', null, ['lat', 'lng'])

        // Define an option with compact syntax
        .option(['s', 'string'], 'A string', 'mydefaultstring');

      // Combined parameters
      assert.equal(argr.get('a'), true);
      assert.equal(argr.get('b'), true);

      // Undefined parameters are not ignored
      assert.equal(argr.get('c'), true);

      // Complex syntax
      assert.equal(argr.get('g').lat, '-50.2');
      assert.equal(argr.get('g').lng, '232');

      // Compact syntax
      assert.equal(argr.get('s'), 'abc-def');

      done();
    });

    it('Should use last defined parameter when doubles encountered', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr('/usr/local/bin/node hello -o first.1 --open second.2'.split(' '))
        .option(['o', 'open'], 'Open a file', 'myfile.dat');

      assert.equal(args.get('o'), 'second.2');

      done();
    });

    it('Should get arguments according to short and long parameter names without signature', function(done){
      var Argr = require(process.cwd()+'/lib/argr');

      var args = Argr('/usr/local/bin/node hello -o world.in --print output.out'.split(' '))
        .option(['o', 'open'], 'Open a file', 'myfile.dat')
        .option(['p', 'print'], 'Print out a log', 'mylog.txt');

      assert.equal(args.get('o'), 'world.in');
      assert.equal(args.get('print'), 'output.out');

      done();
    });
  });
});
