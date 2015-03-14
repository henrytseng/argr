'use strict';

var _ = require('lodash');
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
Argr = function() {
  var _definition = {};
  var _args = [];
  var _data;
  var _parse;
  var _command;
  var _useStrict = false;
  var _usedScript = true;

  /**
   * Initialize values, assumes called by node.js as script (e.g. - first parameter is /usr/bin/node)
   * 
   * @param  {Array}   args         A process.argv list of arguments
   * @return {Argr}                 Itself, chainable
   */
  var _init = function(args) {
    var list = (typeof args === 'string') ? args.split(' ') : args;
    
    _command = _usedScript ? list[1] : list[0];

    // Reset
    _args = Array.prototype.slice.call(list, _usedScript ? 2 : 1);
    _data = null;

    if(_useStrict) {
      _data = _parse(_args);
    }

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
      // Unsupported if operating in strict mode
      if(_useStrict) {
        throw(new Error('Invalid argument syntax ('+param+')'));

      } else {
        data[param] = Param(param, value);
      }
    }
  };

  /**
   * Parse arguments into data, undefined parameters are still stored
   *
   * @param  {Array}   args        A list of arguments
   * @return {Object}              A data object of parsed parameters
   */
  _parse = function(args) {
    var data = {};
    var list = [];

    // Discover parameters (long/short/combined-short)
    var param;
    for(var i=0; i<args.length; i++) {
      param = args[i];

      // Short combined
      if(param.match(/^-[0-9a-zA-Z\?]{2,}/)) {
        var shortList = param
          .replace(/^-/, '')
          .split('');

        for(var j=0; j<shortList.length; j++) {
          _setArg(data, shortList[j], true, _definition[shortList[j]]);
        }

      // Short-single/long
      } else if(param.match(/^-(-)?[0-9a-zA-Z\?]/)) {
        var value = null;
        param = param.replace(/^-(-)?/, '');

        // Using '='
        if(param.indexOf('=') !== -1) {
          value = [param.substr(param.indexOf('=')+1)];
          param = param.substr(0, param.indexOf('='));

        // Check signature
        } else if(_definition[param] && _definition[param].signature) {
          value = args.splice(i+1,_definition[param].signature.length);

        // Follow convention of default
        } else if(_definition[param] && _definition[param].value()) {
          var defaultSize = Array.isArray(_definition[param].value()) ? _definition[param].value().length : 1;
          value = args.splice(i+1,defaultSize);

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

        // Default to true (parameters exists but no possible values)
        if(!value) {
          value = true;
        }

        _setArg(data, param, value, _definition[param]);
      }
    }

    return data;
  };

  // Instance
  return {

    init: _init,

    /**
     * Get command
     * 
     * @return {String} Command from argument vector
     */
    command: function() {
      return _command;
    },

    /**
     * Set script mode, default true
     * 
     * @param  {Boolean} p A flag for command argument start, default true
     * @return {Argr}      Itself, chainable
     */
    usedScript: function(p) {
      _usedScript = p;
      return this;
    },
    
    /**
     * Set strict mode, default false.  Also immediately reruns parse if strict mode.  
     * 
     * @param  {Boolean} p A flag to throw Error on undefined options, default false
     * @return {Argr}      Itself, chainable
     */
    useStrict: function(p) {
      _useStrict = p;
      return this;
    },

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
     * Get list of options
     * 
     * @return {Array} List of options
     */
    options: function() {
      return _.uniq(_.values(_definition));
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
