Argr
====

A command-line argument parser utility designed to parse command-line arguments.  

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

Use as follows where the argument is `'/usr/local/bin/node hello skipped-value -abc -g -50.2 232 -s=abc-def ignored'`

Import the definition

	var Argr = require('argr');

Create an instance of Argr and set the command-line argument

	var argr = Argr(process.argv)

Define some simple options

	argr
	  .option(['a', 'option_a'], 'Option A')
	  .option(['b', 'option_b'], 'Option B');

Define an option with complex syntax specified with signature arguments: `-g -50.2 232`

	argr
	  .option(['g', 'geocoord'], 'A geocoordinate', null, ['lat', 'lng']);

Define an option with compact syntax: `-s=abc-def` with default parameters

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



License
-------

Copyright (c) 2014 Henry Tseng

Released under the MIT license. See LICENSE for details.
