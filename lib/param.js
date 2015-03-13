'use strict';

var Vector = require('./vector');

/**
 * A single parameter with its value vector
 */
var Param = function(name, values, definition) {
  var _vector = null;

  return {

    /**
     * Name
     */
    name: function() {
      return name;
    },

    /**
     * Get value; uses labeling when a signature definition is available, otherwise creates an object with length
     * 
     * @return {Object} A hash of values according to definition
     */
    value: function() {
      if(!_vector && values) _vector = Vector(values, definition && definition.signature);
      return _vector;
    },

    /**
     * Check if a definition exists
     * 
     * @return {Boolean} True if definition used
     */
    isDefined: function() {
      return !!definition;
    },

    /**
     * Definition object
     */
    definition: definition
  };
};

module.exports = Param;
