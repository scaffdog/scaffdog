import test from 'ava';
import { validateConfig } from './validator';

test('valid - full', (t) => {
  const config = {
    files: ['string'],
    variables: {
      foo: 'bar',
    },
    helpers: [() => 'str', () => {}],
    tags: ['{{', '}}'] as const,
  };

  const result = validateConfig(config);

  t.deepEqual(result.files, config.files);
  t.deepEqual(result.variables, config.variables);
  t.is(result.helpers?.length, 2); // deep clone
  t.deepEqual(result.tags, config.tags);
});

test('valid - partial', (t) => {
  const config = {
    files: ['string'],
  };

  t.deepEqual(validateConfig(config), config);
});

test('invalid - empty', (t) => {
  const config = {};

  t.throws(() => {
    validateConfig(config);
  });
});

test('invalid - types - files', (t) => {
  const config = {
    files: null,
  };

  t.throws(() => {
    validateConfig(config);
  });
});

test('invalid - types - tags', (t) => {
  const config = {
    tags: [],
  };

  t.throws(() => {
    validateConfig(config);
  });
});
