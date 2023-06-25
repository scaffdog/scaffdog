import { compile, createContext, extendContext, parse } from '@scaffdog/engine';
import type { Variable } from '@scaffdog/types';
import { expect, test } from 'vitest';
import { helpers } from './helpers';

const context = createContext({
  helpers,
});

test.each([
  ['basic', `{{ eval "parseInt(cnt, 10) > 4 ? 'true' : 'false'" }}`, `true`],
  ['chain', `{{ "foo" | eval "parseInt(cnt, 10) + 5" }}`, `10`],
  [
    'array',
    `{{ eval ("parseInt(cnt,10)+1 / parseInt(cnt,10)+2 / parseInt(cnt,10)+3" | split "/") }}`,
    `6,7,8`,
  ],
])('eval - %s', (_, source, expected) => {
  expect(
    compile(
      parse(source, { tags: context.tags }),
      extendContext(context, {
        variables: new Map<string, Variable>([['cnt', 5]]),
      }),
    ),
  ).toBe(expected);
});
