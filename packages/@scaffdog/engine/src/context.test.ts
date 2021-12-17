import type { Context } from '@scaffdog/types';
import test from 'ava';
import { createContext, extendContext } from './context';
import { helpers } from './helpers';

test('createContext', (t) => {
  const expected: Context = {
    cwd: process.cwd(),
    helpers,
    variables: new Map(),
    tags: ['{{', '}}'],
  };

  t.deepEqual(createContext({}), expected);

  const extendHelpers = new Map([['test', () => '']]);

  t.deepEqual(
    createContext({
      helpers: extendHelpers,
    }),
    {
      ...expected,
      helpers: new Map([...helpers, ...extendHelpers]),
    },
  );

  t.deepEqual(
    createContext({
      cwd: undefined,
      helpers: undefined,
      variables: undefined,
      tags: undefined,
    }),
    createContext({}),
  );
});

test('extendContext', (t) => {
  const helpers1 = new Map([['test1', () => '']]);
  const helpers2 = new Map([['test2', () => '']]);

  const variables1 = new Map([['var1', 'val1']]);
  const variables2 = new Map([['var2', 'val2']]);

  const context = createContext({
    cwd: 'base',
    helpers: helpers1,
    variables: variables1,
  });

  t.deepEqual(extendContext(context, {}), context);

  t.deepEqual(
    extendContext(context, {
      cwd: 'extend',
      helpers: helpers2,
      variables: variables2,
    }),
    {
      ...context,
      cwd: 'extend',
      helpers: new Map([...helpers, ...helpers1, ...helpers2]),
      variables: new Map([...variables1, ...variables2]),
    },
  );
});
