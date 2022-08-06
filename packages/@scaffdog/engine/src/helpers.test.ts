import type { Variable } from '@scaffdog/types';
import { describe, expect, test } from 'vitest';
import { compile } from './compile';
import { createContext } from './context';

const context = createContext({
  variables: new Map<string, Variable>([
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
    ['array', ['str_a', 'str_b', 'str_c']],
    ['object', { key1: 'value1', key2: 'value2' }],
  ]),
});

describe('array', () => {
  test.each([
    ['split', `{{ "a/b/c" | split "/" }}`, `a,b,c`],

    ['join', `{{ "a/b/c" | split "/" | join " " }}`, `a b c`],

    ['seq - first', `{{ seq 5 }}`, `1,2,3,4,5`],
    ['seq - first x last', `{{ seq 0 4 }}`, `0,1,2,3,4`],
    ['seq - first x increment x last', `{{ seq 0 3 9}}`, `0,3,6,9`],
  ])('%s', (_, input, expected) => {
    expect(compile(input, context)).toBe(expected);
  });
});

describe('language', () => {
  test.each([
    ['s2n', `{{ 1 + ("4" | s2n) }}`, `5`],
    [
      's2n - array',
      `{{ for v in ("1,2,3" | split "," | s2n) }}{{ v + 1 }}{{ end }}`,
      `234`,
    ],
    ['s2n - empty', `{{ "" | s2n }}`, `0`],
    ['s2n - non numeric', `{{ "str" | s2n }}`, `0`],

    ['n2s', `{{ "5" + (5 | n2s) }}`, `55`],
    [
      'n2s - array',
      `{{ for v in ("1,2,3" | split "," | n2s) }}{{ v + "0" }}{{ end }}`,
      `102030`,
    ],
    ['n2s - empty', `{{ "" | n2s }}`, ``],
    ['n2s - non numeric', `{{ "foo" | n2s }}`, `foo`],

    ['len - null', `{{ len(null) }}`, `0`],
    ['len - undefined', `{{ len(undefined) }}`, `0`],
    ['len - true', `{{ len(true) }}`, `0`],
    ['len - false', `{{ len(false) }}`, `0`],
    ['len - string', `{{ len("12345") }}`, `5`],
    ['len - number', `{{ len(123) }}`, `3`],
    ['len - array', `{{ len(array) }}`, `3`],
    ['len - object', `{{ len(object) }}`, `2`],

    [
      'eval - basic',
      `{{ eval "parseInt(count5, 10) > 4 ? 'true' : 'false'" }}`,
      `true`,
    ],
    ['eval - chain', `{{ "foo" | eval "parseInt(count5, 10) + 5" }}`, `10`],
    ['eval - chain', `{{ "foo" | eval "parseInt(count5, 10) + 5" }}`, `10`],
    [
      'eval - array',
      `{{ eval ("parseInt(count5,10)+1 / parseInt(count5,10)+2 / parseInt(count5,10)+3" | split "/") }}`,
      `6,7,8`,
    ],
  ])('%s', (_, input, expected) => {
    expect(compile(input, context)).toBe(expected);
  });
});

describe('string', () => {
  test.each([
    ['split', `{{ "a/b/c" | split "/" }}`, `a,b,c`],
    ['join', `{{ "a/b/c" | split "/" | join " " }}`, `a b c`],

    ['camel', `{{ "FooBar" | camel }}`, `fooBar`],
    ['camel - array', `{{ array | camel }}`, `strA,strB,strC`],

    ['snake', `{{ "FooBar" | snake }}`, `foo_bar`],
    ['snake - array', `{{ array | snake }}`, `str_a,str_b,str_c`],

    ['pascal', `{{ "foo-bar" | pascal }}`, `FooBar`],
    ['pascal - array', `{{ array | pascal }}`, `StrA,StrB,StrC`],

    ['kebab', `{{ "FooBar" | kebab }}`, `foo-bar`],
    ['kebab', `{{ array | kebab }}`, `str-a,str-b,str-c`],

    ['constant', `{{ "FooBar" | constant }}`, `FOO_BAR`],
    ['constant - array', `{{ array | constant }}`, `STR_A,STR_B,STR_C`],

    ['upper', `{{ "FooBar" | upper }}`, `FOOBAR`],
    ['upper - array', `{{ array | camel | upper }}`, `STRA,STRB,STRC`],

    ['lower', `{{ "FooBar" | lower }}`, `foobar`],
    ['lower - array', `{{ array | camel | lower }}`, `stra,strb,strc`],

    ['replace - string', `{{ "FooBar" | replace "Bar" "Baz" }}`, `FooBaz`],
    ['replace - regex', `{{ "FooBar" | replace "[oa]" "x" }}`, `FxxBxr`],
    ['replace - array', `{{ array | replace "_" "" }}`, `stra,strb,strc`],

    ['trim', `{{ "  foo " | trim }}`, `foo`],
    ['trim - array', `{{ " a , b , c " | split "," | trim }}`, `a,b,c`],

    ['ltrim', `{{ "  foo " | ltrim }}`, `foo `],
    ['ltrim - array', `{{ " a , b , c " | split "," | ltrim }}`, `a ,b ,c `],

    ['rtrim', `{{ "  foo " | rtrim }}`, `  foo`],
    ['rtrim - array', `{{ " a , b , c " | split "," | rtrim }}`, ` a, b, c`],

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
    [
      'before - array',
      `{{ "line1\nline2\nline3,line4\nline5\nline6" | split "," | before 3 }}`,
      `line1\nline2,line4\nline5`,
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
    [
      'after - array',
      `{{ "line1\nline2\nline3,line4\nline5\nline6" | split "," | after 1 }}`,
      `line2\nline3,line5\nline6`,
    ],
  ])('%s', (_, input, expected) => {
    expect(compile(input, context)).toBe(expected);
  });
});

describe('template', () => {
  test.each([
    ['noop', `{{ "foo" | noop }}`, ``],
    ['noop - array', `{{ array | noop }}`, `,,`],

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
    [
      'define - array',
      `{{ array | define "key" -}} key = {{ key }}`,
      `,,key = str_c`,
    ],
  ])('%s', (_, input, expected) => {
    expect(compile(input, context)).toBe(expected);
  });
});
