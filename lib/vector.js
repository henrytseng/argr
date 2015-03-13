'use strict';

/**
 * A value vector using signature; builds a hash with labels from signature if exists otherwise returns values
 */
var Vector = function(values, signature) {
  var _vector = null;

  // Use labeling (signature)
  if(Array.isArray(values) && Array.isArray(signature)) {
    _vector = {};
    signature.forEach(function(name, i) {
      _vector[name] = values[i];
    });

  // Without signature
  } else {
    _vector = values;
  }

  return _vector;
};

module.exports = Vector;
