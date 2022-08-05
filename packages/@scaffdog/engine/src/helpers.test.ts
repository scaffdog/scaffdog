import { expect, test } from 'vitest';
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

test.each([
  /**
   * string utils
   */
  ['camel', `{{ "FooBar" | camel }}`, `fooBar`],
  ['snake', `{{ "FooBar" | snake }}`, `foo_bar`],
  ['pascal', `{{ "foo-bar" | pascal }}`, `FooBar`],
  ['kebab', `{{ "FooBar" | kebab }}`, `foo-bar`],
  ['constant', `{{ "FooBar" | constant }}`, `FOO_BAR`],
  ['upper', `{{ "FooBar" | upper }}`, `FOOBAR`],
  ['lower', `{{ "FooBar" | lower }}`, `foobar`],
  ['replace - string', `{{ "FooBar" | replace "Bar" "Baz" }}`, `FooBaz`],
  ['replace - regex', `{{ "FooBar" | replace "[oa]" "x" }}`, `FxxBxr`],
  ['trim', `{{ "  foo " | trim }}`, `foo`],
  ['ltrim', `{{ "  foo " | ltrim }}`, `foo `],
  ['rtrim', `{{ "  foo " | rtrim }}`, `  foo`],
  ['before - number', `{{ multiline | before 3 }}`, `line1\nline2`],
  [
    'before - number (offset)',
    `{{ multiline | before 5 -1 }}`,
    `line1\nline2\nline3`,
  ],
  [
    'before - string',
    `{{ multiline | before "line4" }}`,
    `line1\nline2\nline3`,
  ],
  [
    'before - string (offset)',
    `{{ multiline | before "line2" 2 }}`,
    `line1\nline2\nline3`,
  ],
  [
    'before - string (no match)',
    `{{ multiline | before "NOT_FOUND" }}`,
    `line1\nline2\nline3\nline4\nline5`,
  ],
  ['after - number', `{{ multiline | after 2 }}`, `line3\nline4\nline5`],
  ['after - number (offset)', `{{ multiline | after 4 -1 }}`, `line4\nline5`],
  ['after - string', `{{ multiline | after "line4" }}`, `line5`],
  [
    'after - string (offset)',
    `{{ multiline | after "line2" 1 }}`,
    `line4\nline5`,
  ],
  [
    'after - string (no match)',
    `{{ multiline | after "NOT_FOUND" }}`,
    `line1\nline2\nline3\nline4\nline5`,
  ],

  /**
   * language
   */
  [
    'eval - basic',
    `{{ eval "parseInt(count5, 10) > 4 ? 'true' : 'false'" }}`,
    `true`,
  ],
  ['eval - chain', `{{ "foo" | eval "parseInt(count5, 10) + 5" }}`, `10`],
  ['eval - chain', `{{ "foo" | eval "parseInt(count5, 10) + 5" }}`, `10`],

  /**
   * template helpers
   */
  ['noop', `{{ "foo" | noop }}`, ``],
  [
    'define - basic',
    `{{ define "value" "key" -}} key = {{ key }}`,
    `key = value`,
  ],
  [
    'define - chain',
    `{{ "value" | define "key" -}} key = {{ key }}`,
    `key = value`,
  ],
])('%s', (_, input, expected) => {
  expect(compile(input, context)).toBe(expected);
});
