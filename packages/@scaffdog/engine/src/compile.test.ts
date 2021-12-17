import type { ExecutionContext } from 'ava';
import test from 'ava';
import type { Context } from '@scaffdog/types';
import { createContext, extendContext } from './context';
import { compile } from './compile';

const context = createContext({
  variables: new Map([['name', 'scaffdog']]),
  helpers: new Map([['greet', (_, name: string) => `Hi ${name}!`]]),
});

const valid = (
  t: ExecutionContext,
  input: string,
  context: Context,
  expected: string,
) => {
  t.is(compile(input, context), expected);
};

test(
  'basic',
  valid,
  'before {{ name | greet }} after',
  context,
  'before Hi scaffdog! after',
);

test(
  'custom tag',
  valid,
  'before <%= name | greet =%> after',
  extendContext(context, {
    tags: ['<%=', '=%>'],
  }),
  'before Hi scaffdog! after',
);
