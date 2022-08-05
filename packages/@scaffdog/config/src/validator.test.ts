import { test, expect, describe } from 'vitest';
import { validateConfig } from './validator';

describe('valid', () => {
  test('full', () => {
    const config = {
      files: ['string'],
      variables: {
        foo: 'bar',
      },
      helpers: [() => 'str', () => {}],
      tags: ['{{', '}}'] as const,
    };

    const result = validateConfig(config);

    expect(result.files).toEqual(config.files);
    expect(result.variables).toEqual(config.variables);
    expect(result.helpers?.length).toBe(2); // deep clone
    expect(result.tags).toEqual(config.tags);
  });

  test('partial', () => {
    const config = {
      files: ['string'],
    };

    expect(validateConfig(config)).toEqual(config);
  });
});

describe('invalid', () => {
  test('empty', () => {
    const config = {};

    expect(() => {
      validateConfig(config);
    }).toThrowError();
  });

  test('types - files', () => {
    const config = {
      files: null,
    };

    expect(() => {
      validateConfig(config);
    }).toThrowError();
  });

  test('types - tags', () => {
    const config = {
      tags: [],
    };

    expect(() => {
      validateConfig(config);
    }).toThrowError();
  });
});
