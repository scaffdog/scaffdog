import type { Context } from '@scaffdog/types';
import type { ExecutionContext } from 'ava';
import test from 'ava';
import { compile } from './compile';
import { createContext, extendContext } from './context';

const context = createContext({});

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

/**
 * language
 */
test(
  'eval - basic',
  equals,
  extendContext(context, {
    variables: new Map([['count', '5']]),
  }),
  `{{ eval "parseInt(count, 10) > 4 ? 'true' : 'false'" }}`,
  `true`,
);

test(
  'eval - chain',
  equals,
  extendContext(context, {
    variables: new Map([['count', '5']]),
  }),
  `{{ "foo" | eval "parseInt(count, 10) + 5" }}`,
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
