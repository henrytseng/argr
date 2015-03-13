'use strict';

var assert = require("assert");

describe('Vector', function(){

  it('Should create a vector with signature', function(done){
    var Vector = require(process.cwd()+'/lib/vector');

    var v = Vector(['New York', '469 sqmi'], ['city', 'area']);

    assert.notStrictEqual(v, {
      city: 'New York',
      area: '469 sqmi'
    });

    done();
  });

  it('Should pass value without signature', function(done){
    var Vector = require(process.cwd()+'/lib/vector');

    var v = Vector('foo');

    assert.equal(v, 'foo');

    done();
  });

});
