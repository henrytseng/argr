import assert from 'assert';
import Argr from '../../lib/argr.js';

describe('Argr', function() {

  describe('#init()', function() {
    it('Should initialize arguments without error', function() {
      Argr().init('/usr/local/bin/node hello tests/data/config.json'.split(' '));
    });

    it('Should initialize throw error on undefined options in strict mode', function() {
      assert.throws(function() {
        Argr()
          .useStrict(true)
          .init('/usr/local/bin/node hello -h');
      });
    });

    it('Should initialize not throw error on supported arguments in strict mode', function() {
      Argr()
        .option(['a', 'option_a'], 'Option A')
        .option(['b', 'option_b'], 'Option B')
        .useStrict(true)
        .init('/usr/local/bin/node hello -ab');
    });
  });

  describe('#command()', function() {
    it('Should get command', function() {
      assert.equal(
        Argr().init('/usr/local/bin/node hello tests/data/config.json').command(),
        'hello'
      );
    });

    it('Should get command without script', function() {
      assert.equal(
        Argr()
          .usedScript(false)
          .init('hello tests/data/config.json')
          .command(),
        'hello'
      );
    });
  });

  describe('#option()', function() {
    it('Should set/get definition with only one short/long param', function() {
      const args = Argr();

      // Set
      args.option('p', 'Lorem ipsum', 'abc');

      // Get
      const optDef = args.option('p');
      assert.equal(optDef.value(), 'abc');
      assert.equal(optDef.description, 'Lorem ipsum');
    });

    it('Should get non-existing definition as undefined', function() {
      const args = Argr();

      // Get
      const optDef = args.option('p');
      assert.ok(typeof optDef === 'undefined');
    });

    it('Should accept short and long parameter names', function() {
      const args = Argr();

      // Set
      args.option(['p', 'longParam'], 'Lorem ipsum', 'abc');

      // Get short
      const shortDef = args.option('p');
      assert.equal(shortDef.value(), 'abc');
      assert.equal(shortDef.description, 'Lorem ipsum');

      // Get long
      const longDef = args.option('longParam');
      assert.equal(longDef.value(), 'abc');
      assert.equal(longDef.description, 'Lorem ipsum');
    });
  });

  describe('#options()', function() {
    it('Should get options in definition', function() {
      const argr = Argr()

        .init('/usr/local/bin/node hello skipped-value -abc -g -50.2 232 -s=abc-def ignored')

        .option(['a', 'option_a'], 'Option A')
        .option(['b', 'option_b'], 'Option B')
        .option(['g', 'geocoord'], 'A geocoordinate', null, ['lat', 'lng'])
        .option(['s', 'string'], 'A string', 'mydefaultstring');

      assert.equal(argr.options().length, 4);
      assert.equal(argr.options()[0].param[0], 'a');
      assert.equal(argr.options()[1].param[0], 'b');
      assert.equal(argr.options()[2].param[0], 'g');
      assert.equal(argr.options()[3].param[0], 's');
    });
  });

  describe('#actions()', function() {
    it('Should get any actions as non-parameters', function() {
      const argr = Argr()
        .init('/usr/local/bin/node hello action-value -abc -g -50.2 232 -s=abc-def second_value')
        .option(['a', 'option_a'], 'Option A')
        .option(['b', 'option_b'], 'Option B')
        .option(['g', 'geocoord'], 'A geocoordinate', null, ['lat', 'lng'])
        .option(['s', 'string'], 'A string', 'mydefaultstring');

      assert.equal(argr.actions().length, 2);
      assert.equal(argr.actions()[0], 'action-value');
      assert.equal(argr.actions()[1], 'second_value');
      assert.ok(argr.action('action-value'));
      assert.ok(argr.action('second_value'));
      assert.ok(!argr.action('not-called'));
    });
  });

  describe('#get()', function() {
    it('Should get default values according to definition default', function() {
      const args = Argr()

        .init('/usr/local/bin/node hello -k'.split(' '))
        .option(['o', 'open'], 'Open a file', 'myfile.m');

      // Default value
      assert.equal(args.get('o'), 'myfile.m');

      // Non-existing
      assert.equal(args.get('p'), false);
    });

    it('Should get arguments with short combined parameters', function() {
      const args = Argr()

        .init('/usr/local/bin/node hello skipped-value -fbqKx ignore -a'.split(' '))

        .option(['f', 'foo'], 'Sed ut')
        .option('q', 'Lorem ipsum')
        .option(['K', 'kolor'], 'Ipsum')
        .option(['a', 'About'], 'Dolor ut')
        .option(['u', 'wasNotProvided'], 'Not defined');

      // Provided
      assert.equal(args.get('f'), true);
      assert.equal(args.get('foo'), true);

      // Provided short only
      assert.equal(args.get('q'), true);

      // Not defined but provided
      assert.equal(args.get('b'), true);

      // Was not provided
      assert.equal(args.get('u'), false);
      assert.equal(args.get('wasNotProvided'), false);

      // Provided single
      assert.equal(args.get('a'), true);
    });

    it('Should support question mark as a parameter in combo (?)', function() {
      const argr = Argr()

        .init('/usr/local/bin/node hello skipped-value -a?b')

        .option(['?', 'help'], 'Display help');

      // Combined parameters
      assert.equal(argr.get('?'), true);
    });

    it('Should support question mark as a parameter alone (?)', function() {
      const argr = Argr()

        .init('/usr/local/bin/node hello skipped-value -?')

        .option(['?', 'help'], 'Display help');

      // Combined parameters
      assert.equal(argr.get('?'), true);
    });

    it('Should ignore parameters in signatures even if they look like arguments', function() {
      const argr = Argr()

        .init('/usr/local/bin/node hello skipped-value -abc -g -50.2 232 -s=abc-def ignored'.split(' '))

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
    });

    it('Should allow use of string syntax instead of process.argv', function() {
      const argr = Argr()

        .init('/usr/local/bin/node hello skipped-value -abc -g -50.2 232 -s=abc-def ignored')

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
    });

    it('Should use last defined parameter when doubles encountered', function() {
      const args = Argr()

        .init('/usr/local/bin/node hello -o first.1 --open second.2'.split(' '))
        .option(['o', 'open'], 'Open a file', 'myfile.dat');

      assert.equal(args.get('o'), 'second.2');
    });

    it('Should get arguments according to short and long parameter names without signature', function() {
      const args = Argr()

        .init('/usr/local/bin/node hello -o world.in --print output.out'.split(' '))

        .option(['o', 'open'], 'Open a file', 'myfile.dat')
        .option(['p', 'print'], 'Print out a log', 'mylog.txt');

      assert.equal(args.get('o'), 'world.in');
      assert.equal(args.get('print'), 'output.out');
    });

    it('Should default to pattern of defaults single value', function() {
      const args = Argr()

        .init('/usr/local/bin/node hello -o world.in')

        .option(['o', 'open'], 'Open a file', 'myfile.dat');

      assert.equal(args.get('o'), 'world.in');
    });

    it('Should default to pattern of defaults Array value', function() {
      const args = Argr()

        .init('/usr/local/bin/node hello -o world.in take.out')

        .option(['o', 'open'], 'Open a file', ['myfile.dat', 'coypfile.dat']);

      assert.notStrictEqual(args.get('o'), ['world.in', 'take.out']);
    });
  });

  describe('#usedScript', function() {
    it('Should initialize arguments without use of /usr/bin/node and get parameters correctly', function() {
      const args = Argr()
        .usedScript(false)
        .init('hello -f tests/data/config.json')
        .option(['f', 'file'], 'Open a file');

      assert.equal(args.get('f'), 'tests/data/config.json');
    });
  });
});
