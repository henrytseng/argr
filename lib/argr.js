'use strict';

var Param = require('./param');
var Vector = require('./vector');

var Argr;

/**
 * Argr parses command-line arguments.  
 *
 * Short parameters are denoted with a "-" prefix.
 *
 * Long parameters are denoted with a "--" prefix.  
 */
Argr = function(args, usedScript) {
  var _definition = {};
  var _args = [];
  var _data;

  /**
   * Initialize values, assumes called by node.js as script (e.g. - first parameter is /usr/bin/node)
   * 
   * @param  {Array}   args         A process.argv list of arguments
   * @param  {Boolean} [usedScript] A flag for command argument start, default true
   * @return {Argr}                 Itself, chainable
   */
  var _init = function(args, usedScript) {
    if(typeof args === 'string') args = args.split(' '); 
    if(typeof usedScript === 'undefined') usedScript = true;

    // Reset
    _definition = {};
    _args = Array.prototype.slice.call(args, usedScript ? 2 : 1);
    _data = null;

    return this;
  };

  /**
   * Associate a parameter with its short and long, if it exists
   * 
   * @param  {Object} data       A data object to setup
   * @param  {String} param      A short/long parameter name
   * @param  {Mixed}  value      A value object
   */
  var _setArg = function(data, param, value) {
    if(_definition[param]) {
      var paramInstance = Param(param, value, _definition[param]);
      _definition[param].param.forEach(function(p) {
        data[p] = paramInstance;
      });

    } else {
      data[param] = Param(param, value);
    }
  };

  /**
   * Parse arguments into data, undefined parameters are still stored
   *
   * @param  {Array}  args A list of arguments
   * @return {Object}      A data object of parsed parameters
   */
  var _parse = function(args) {
    var data = {};
    var list = [];

    // Discover parameters (long/short/combined-short)
    var param;
    for(var i=0; i<args.length; i++) {
      param = args[i];

      // Short combined
      if(param.match(/^-[0-9a-zA-Z]{2,}/)) {
        var shortList = param
          .replace(/^-/, '')
          .split('');

        for(var j=0; j<shortList.length; j++) {
          _setArg(data, shortList[j], true, _definition[shortList[j]]);
        }

      // Short-single/Long
      } else if(param.match(/^-(-)?[0-9a-zA-Z]/)) {
        var value = null;
        param = param.replace(/^-(-)?/, '');

        // Using '='
        if(param.indexOf('=') !== -1) {
          value = [param.substr(param.indexOf('=')+1)];
          param = param.substr(0, param.indexOf('='));

        // Check signature
        } else if(_definition[param] && _definition[param].signature) {
          value = args.splice(i+1,_definition[param].signature.length);

        // Use any following non-defined as values
        } else {
          for(var k=i+1; k<args.length; k++) {
            var checkParam = args[k].replace(/^-(-)?/, '');
            if(!_definition[checkParam]) {
              if(!value) value = []; 
              value = value.concat(args[k]);
              i = k;

            } else {
              break;
            }
          }
        }

        _setArg(data, param, value, _definition[param]);
      }
    }

    return data;
  };

  // Initialize
  if(args) {
    _init(args, usedScript);
  }

  // Instance
  return {

    init: _init,

    /**
     * Setter/getter for a defined option.  If a signature is used the value contain a hash using the Array values used as keys.
     *
     * A signature cannot be used with combined parameters
     * 
     * @param  {Mixed}  param       A parameter name String, or Array [short, long, alternate...] parameter name(s) and aliases
     * @param  {String} description A description
     * @param  {Mixed}  [values]    An optional default value, true if not specified
     * @param  {Array}  [signature] An optional signature, additional required arguments; listed in Array format
     * @return {Argr}               Itself, chainable
     */
    option: function(param, description, values, signature) {
      var optionArgs = arguments;
      if(optionArgs.length === 1) {
        return _definition[param];
      }

      var paramList = Array.isArray(param) ? param : [param];
      var vector;
      var optionDef = {
        param: paramList,
        value: function() {
          // Default, no values or signature
          if(optionArgs.length === 2) return false;

          if(!vector) vector = Vector(values, signature);
          return vector;
        },
        signature: Array.isArray(signature) ? signature : null,
        description: description
      };

      // Define both short/long
      paramList.forEach(function(p) {
        _definition[p] = optionDef;
      });

      return this;
    },

    /**
     * Get a value associated with argument
     *
     * @param  {Mixed}  name A parameter name (short or long)
     * @return {Object}      A data object associated with the value
     */
    get: function(name) {
      // Parse once
      if(!_data) _data = _parse(_args);

      // Fallback to defaults
      var param = _data[name] || _definition[name];

      // False for not provided
      return (!param) ? false : param.value();
    }
  };
};

module.exports = Argr;
