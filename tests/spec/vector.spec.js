import assert from 'assert';
import Vector from '../../lib/vector.js';

describe('Vector', function() {

  it('Should create a vector with signature', function() {
    const v = Vector(['New York', '469 sqmi'], ['city', 'area']);

    assert.notStrictEqual(v, {
      city: 'New York',
      area: '469 sqmi'
    });
  });

  it('Should pass value without signature', function() {
    const v = Vector('foo');

    assert.equal(v, 'foo');
  });

});
