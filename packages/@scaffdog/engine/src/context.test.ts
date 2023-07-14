import type { Context } from '@scaffdog/types';
import { test, expect } from 'vitest';
import { createContext, extendContext } from './context.js';
import { helpers } from './helpers.js';

test('createContext', () => {
  const expected: Context = {
    cwd: process.cwd(),
    helpers,
    variables: new Map(),
    tags: ['{{', '}}'],
  };

  expect(createContext({})).toEqual(expected);

  const extendHelpers = new Map([['test', () => '']]);

  expect(
    createContext({
      helpers: extendHelpers,
    }),
  ).toEqual({
    ...expected,
    helpers: new Map([...helpers, ...extendHelpers]),
  });

  expect(
    createContext({
      cwd: undefined,
      helpers: undefined,
      variables: undefined,
      tags: undefined,
    }),
  ).toEqual(createContext({}));
});

test('extendContext', () => {
  const helpers1 = new Map([['test1', () => '']]);
  const helpers2 = new Map([['test2', () => '']]);

  const variables1 = new Map([['var1', 'val1']]);
  const variables2 = new Map([['var2', 'val2']]);

  const context = createContext({
    cwd: 'base',
    helpers: helpers1,
    variables: variables1,
  });

  expect(extendContext(context, {})).toEqual(context);

  expect(
    extendContext(context, {
      cwd: 'extend',
      helpers: helpers2,
      variables: variables2,
    }),
  ).toEqual({
    ...context,
    cwd: 'extend',
    helpers: new Map([...helpers, ...helpers1, ...helpers2]),
    variables: new Map([...variables1, ...variables2]),
  });
});
