import type { Context } from '@scaffdog/types';
import type { ExecutionContext } from 'ava';
import test from 'ava';
import { compile } from './compile';
import { createContext } from './context';

const context = createContext({
  variables: new Map([
    ['count5', '5'],
    [
      'multiline',
      `
line1
line2
line3
line4
line5
    `.trim(),
    ],
  ]),
});

const equals = (
  t: ExecutionContext,
  ctx: Context,
  input: string,
  expected: string,
) => {
  const output = compile(input, ctx);
  t.is(output, expected);
};

/**
 * string utils
 */
test('camel', equals, context, `{{ "FooBar" | camel }}`, `fooBar`);

test('snake', equals, context, `{{ "FooBar" | snake }}`, `foo_bar`);

test('pascal', equals, context, `{{ "foo-bar" | pascal }}`, `FooBar`);

test('kebab', equals, context, `{{ "FooBar" | kebab }}`, `foo-bar`);

test('constant', equals, context, `{{ "FooBar" | constant }}`, `FOO_BAR`);

test('upper', equals, context, `{{ "FooBar" | upper }}`, `FOOBAR`);

test('lower', equals, context, `{{ "FooBar" | lower }}`, `foobar`);

test(
  'replace - string',
  equals,
  context,
  `{{ "FooBar" | replace "Bar" "Baz" }}`,
  `FooBaz`,
);

test(
  'replace - regex',
  equals,
  context,
  `{{ "FooBar" | replace "[oa]" "x" }}`,
  `FxxBxr`,
);

test('trim', equals, context, `{{ "  foo " | trim }}`, `foo`);

test('ltrim', equals, context, `{{ "  foo " | ltrim }}`, `foo `);

test('rtrim', equals, context, `{{ "  foo " | rtrim }}`, `  foo`);

test(
  'head - number',
  equals,
  context,
  `{{ multiline | head 2 }}`,
  `line1\nline2`,
);

test(
  'head - number (offset)',
  equals,
  context,
  `{{ multiline | head 4 -1 }}`,
  `line1\nline2\nline3`,
);

test(
  'head - string',
  equals,
  context,
  `{{ multiline | head "line4" }}`,
  `line1\nline2\nline3\nline4`,
);

test(
  'head - string (offset)',
  equals,
  context,
  `{{ multiline | head "line2" 2 }}`,
  `line1\nline2\nline3\nline4`,
);

test(
  'head - string (no match)',
  equals,
  context,
  `{{ multiline | head "NOT_FOUND" }}`,
  `line1\nline2\nline3\nline4\nline5`,
);

test(
  'tail - number',
  equals,
  context,
  `{{ multiline | tail 2 }}`,
  `line4\nline5`,
);

test(
  'tail - number (offset)',
  equals,
  context,
  `{{ multiline | tail 4 -1 }}`,
  `line3\nline4\nline5`,
);

test(
  'tail - string',
  equals,
  context,
  `{{ multiline | tail "line4" }}`,
  `line4\nline5`,
);

test(
  'tail - string (offset)',
  equals,
  context,
  `{{ multiline | tail "line2" 2 }}`,
  `line4\nline5`,
);

test(
  'tail - string (no match)',
  equals,
  context,
  `{{ multiline | tail "NOT_FOUND" }}`,
  `line1\nline2\nline3\nline4\nline5`,
);

/**
 * language
 */
test(
  'eval - basic',
  equals,
  context,
  `{{ eval "parseInt(count5, 10) > 4 ? 'true' : 'false'" }}`,
  `true`,
);

test(
  'eval - chain',
  equals,
  context,
  `{{ "foo" | eval "parseInt(count5, 10) + 5" }}`,
  `10`,
);

/**
 * template helpers
 */
test('noop', equals, context, `{{ "foo" | noop }}`, ``);

test(
  'define - basic',
  equals,
  context,
  `{{ define "value" "key" -}} key = {{ key }}`,
  `key = value`,
);

test(
  'define - chain',
  equals,
  context,
  `{{ "value" | define "key" -}} key = {{ key }}`,
  `key = value`,
);
