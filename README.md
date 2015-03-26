Argr
====

[![Build Status](https://travis-ci.org/henrytseng/argr.svg)](https://travis-ci.org/henrytseng/argr)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/henrytseng/argr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A command-lineargument parser utility designed to parse command-line arguments.  

Use complex parameters and define a argument signature.  

`command --param value1 value2`

Use compact syntax.  

`command -p=value2`

And combine parameters

`command -pjk`



Installation
------------

Run the following

	npm install argr --save



Quick Start
-----------

Import the definition

	var Argr = require('argr');

Create an instance of Argr and set the command-line argument (e.g. - `/usr/local/bin/node hello -abc -g -50.2 232 -s=abc-def`)

	var argr = Argr().init('/usr/local/bin/node hello -abc -g -50.2 232 -s=abc-def')

Define some **simple options**, to accept the following `hello -ab` and `hello --option_a --option_b` 

	argr
	  .option(['a', 'option_a'], 'Option A')
	  .option(['b', 'option_b'], 'Option B');

Define an option with **complex syntax** specified with signature arguments: `-g -50.2 232` where `-g` option will always expect two additional values following

	argr
	  .option(['g', 'geocoord'], 'A geocoordinate', null, ['lat', 'lng']);

Define an option with **compact syntax**: `-s=abc-def` with default parameters

	argr
	  .option(['s', 'string'], 'A string', 'mydefaultstring');

Get parameters

	assert.equal(argr.get('a'), true);
	assert.equal(argr.get('b'), true);

Undefined parameters are not ignored

	assert.equal(argr.get('c'), true);

Access complex syntax with signatures as hash Objects

	assert.equal(argr.get('g').lat, '-50.2');
	assert.equal(argr.get('g').lng, '232');

Use compact syntax with `{name}={value}`

	assert.equal(argr.get('s'), 'abc-def');



Argr Class
----------

Create an instance of argument parser.  

	var Argr = require('argr');
	var a = Argr().init(process.argv);
	


argr.usedScript(flag)
---------------------

### flag {Boolean}

A flag for command argument start, default true.  

True assumes use of `/usr/local/bin/node` and starts parsing at index 2.  False starts parsing at index 1.  

Must be set before `.init()`

	var a = Argr()
		.usedScript(true)
		.init('/usr/local/bin/node hello -?');



argr. useStrict(flag)
---------------------

### flag {Boolean}

A flag to throw Error on undefined options, default false.  

	var a = Argr()
		.useStrict(true)
		.init('/usr/local/bin/node hello -?');

An error is thrown if `?` is not defined through `argr.option()` during initialization.  

Must be set before `.init()`



argr.init(args)
---------------

Initialize, chainable

### args {Mixed}

`Object` Create an argument parser instance from `process.argv` argument vector.  

	var Argr = require('argr');
	var a = Argr().init(process.argv);

`String` Or create an argument parser from string.

	var Argr = require('argr');
	var a = Argr().init('/usr/local/bin/node hello -f tests/data/config.json');
	


argr.command()
--------------

Get command from argument vector.

	var a = Argr().init('/use/local/bin/node hello -f tests/data/config.json');
	assert(a.command() === 'hello');



argr.option(param, description, [values], [signature])
--------------------------------------------------

Define an options and its syntax.  Arguments that are not define will be parsed anyway.  

Chainable

### param {Mixed}

`String` A parameter name 

	// cmd -y
	argr.option('y', 'Lorem ipsum')

`Array` ['a', 'apple', alternate-form...] parameter name(s) and aliases

	// short: cmd -f
	//  long: cmd --fruit
	argr.option(['f', 'fruit'], 'A fruit')

### description {String}

A description value

### values {Mixed}

An optional set of default values

`Boolean` A single default Boolean if no argument was passed

`Number` A single default Number if no argument was passed
 
`String` A single default String if no argument was passed

`Array` A set of default values, intending to match a signature.  Uses the signature to create a hash of values using the signature as keys and the Array as values.  

### signature {Array}

An optional argument signature.  Specifying a signature will expect the next argument(s) to be values.  

	// cmd -g -50.32 74.2 
	argr.option(['g', 'geocoords'], 'A set of geocoordinates', null, ['lat', 'lng'])

The option `-g` will expect `lat` and `lng` coordinates when used; `argr.get('g')` returns:

	{
		'lat': '-50.32',
		'lng': '74.2'
	}



argr.option(param)
------------------

Get a defined option parameter

	argr.option('g')

Retrieves a full description of the defined parameters

	{
		param: ['g', 'geocoords'],
		value: {Function},
		signature: ['lat', 'lng'],
		description: 'A set of geocoordinates'
	}

### param {Mixed}

`String` A name of a specific parameter

`Array` A set of acceptable parameter names or aliases



argr.options()
--------------

Get all defined options

	a.options()

All of the option definitions



argr.get(name)
--------------

Retrieve parameters according to the name of the parameter.  Undefind parameters are returned as well but must still be prefixed with either `-` or `--` (e.g. - `--color`).  

### name {String}

A name of a specific parameter




Combined parameters
-------------------

	var argr = Argr().init('/usr/local/bin/node cmd -zxvf');

Parameters can be combined for shorter syntax each will become parameters.  

	assert.equal(argr.get('z'), true);
	assert.equal(argr.get('x'), true);
	assert.equal(argr.get('v'), true);
	assert.equal(argr.get('f'), true);



Undefined parameters are not ignored
-------------------

Any undefined arguments will still be retrievable using `.get('n')` where `'n'` is the name.  



Complex syntax using signatures
-------------------

	var argr = Argr().init('/usr/local/bin/node cmd -g -50.32 74.2');
	argr.option(['g', 'geocoords'], 'A set of geocoordinates', null, ['lat', 'lng'])

Using a signature will allow complex syntax returning the result as a hash where the keys are defined in the signature.  

	assert.equal(argr.get('g').lat, '-50.32');
	assert.equal(argr.get('g').lng, '74.2');



Compact syntax
-------------------

	var argr = Argr().init('/usr/local/bin/node cmd -f=myfile.txt');
	
Compact syntax allows the use of `[name]=[value]` pairs

	assert.equal(argr.get('f'), 'myfile.txt');



License
-------

Copyright (c) 2014 Henry Tseng

Released under the MIT license. See LICENSE for details.
