import Param from './param.js';
import Vector from './vector.js';

/**
 * Argr parses command-line arguments.
 *
 * Short parameters are denoted with a "-" prefix.
 *
 * Long parameters are denoted with a "--" prefix.
 */
const Argr = function() {
  let _definition = {};
  let _actions = [];
  let _args = [];
  let _data;
  let _parse;
  let _command;
  let _useStrict = false;
  let _usedScript = true;

  /**
   * Initialize values, assumes called by node.js as script (e.g. - first parameter is /usr/bin/node)
   *
   * @param  {Array}   args         A process.argv list of arguments
   * @return {Argr}                 Itself, chainable
   */
  const _init = function(args) {
    const list = (typeof args === 'string') ? args.split(' ') : args;

    _command = _usedScript ? list[1] : list[0];

    // Reset
    _args = Array.prototype.slice.call(list, _usedScript ? 2 : 1);
    _data = null;

    if (_useStrict) {
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
  const _setArg = function(data, param, value) {
    if (_definition[param]) {
      const paramInstance = Param(param, value, _definition[param]);
      _definition[param].param.forEach(function(p) {
        data[p] = paramInstance;
      });

    } else {
      // Unsupported if operating in strict mode
      if (_useStrict) {
        throw(new Error('Invalid argument syntax (' + param + ')'));

      } else {
        data[param] = Param(param, value);
      }
    }
  };

  /**
   * Associate non-parameter as an action
   *
   * @param  {String} param  A String non-parameter argument
   */
  const _setAction = function(param) {
    _actions.push(param);
  };

  /**
   * Parse arguments into data, undefined parameters are still stored
   *
   * @param  {Array}   args        A list of arguments
   * @return {Object}              A data object of parsed parameters
   */
  _parse = function(args) {
    const data = {};

    // Discover parameters (long/short/combined-short)
    for (let i = 0; i < args.length; i++) {
      let param = args[i];

      // Short combined
      if (param.match(/^-[0-9a-zA-Z\?]{2,}/)) {
        const shortList = param
          .replace(/^-/, '')
          .split('');

        for (let j = 0; j < shortList.length; j++) {
          _setArg(data, shortList[j], true, _definition[shortList[j]]);
        }

      // Short-single/long
      } else if (param.match(/^-(-)?[0-9a-zA-Z\?]/)) {
        let value = null;
        param = param.replace(/^-(-)?/, '');

        // Using '='
        if (param.indexOf('=') !== -1) {
          value = [param.substr(param.indexOf('=') + 1)];
          param = param.substr(0, param.indexOf('='));

        // Check signature
        } else if (_definition[param] && _definition[param].signature) {
          value = args.splice(i + 1, _definition[param].signature.length);

        // Follow convention of default
        } else if (_definition[param] && _definition[param].value()) {
          const defaultSize = Array.isArray(_definition[param].value()) ? _definition[param].value().length : 1;
          value = args.splice(i + 1, defaultSize);

        // Use any following non-defined as values
        } else {
          for (let k = i + 1; k < args.length; k++) {
            const checkParam = args[k].replace(/^-(-)?/, '');
            if (!_definition[checkParam]) {
              if (!value) value = [];
              value = value.concat(args[k]);
              i = k;

            } else {
              break;
            }
          }
        }

        // Default to true (parameters exists but no possible values)
        if (!value) {
          value = true;
        }

        _setArg(data, param, value, _definition[param]);

      // Arbitrary
      } else {
        _setAction(param);
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
      const optionArgs = arguments;
      if (optionArgs.length === 1) {
        return _definition[param];
      }

      const paramList = Array.isArray(param) ? param : [param];
      let vector;
      const optionDef = {
        param: paramList,
        value: function() {
          // Default, no values or signature
          if (optionArgs.length === 2) return false;

          if (!vector) vector = Vector(values, signature);
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
      const options = [];
      Object.keys(_definition).forEach((key) => {
        if (options.indexOf(_definition[key]) === -1) {
          options.push(_definition[key]);
        }
      });
      return options;
    },

    /**
     * Get a list of actions
     *
     * @return {Array} List of actions
     */
    actions: function() {
      // Parse once
      if (!_data) _data = _parse(_args);

      return _actions.slice(0);
    },

    /**
     * Check if action was passed
     *
     * @param  {String}  name  A name of an action
     * @return {Boolean}       True if action was passed
     */
    action: function(name) {
      return _actions.indexOf(name) !== -1;
    },

    /**
     * Get a value associated with argument
     *
     * @param  {Mixed}  name A parameter name (short or long)
     * @return {Object}      A data object associated with the value
     */
    get: function(name) {
      // Parse once
      if (!_data) _data = _parse(_args);

      // Fallback to defaults
      const param = _data[name] || _definition[name];

      // False for not provided
      return (!param) ? false : param.value();
    }
  };
};

export default Argr;
