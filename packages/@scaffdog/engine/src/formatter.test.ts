import type { ExecutionContext } from 'ava';
import test from 'ava';
import { Formatter } from './formatter';
import { Parser } from './parser';
import { tokenize } from './tokenize';

const format = (input: string) => {
  const parser = new Parser(tokenize(input), input);

  return new Formatter().format(parser.parse());
};

const valid = (t: ExecutionContext, input: string, expected: string) => {
  t.is(format(input), expected);
};

test('raw', valid, `no change`, `no change`);

test('null', valid, `foo {{null     }} baz`, `foo {{ null }} baz`);

test(
  'undefined',
  valid,
  `foo {{     undefined}} baz`,
  `foo {{ undefined }} baz`,
);

test('true', valid, `foo {{true}} baz`, `foo {{ true }} baz`);

test('false', valid, `foo {{false}} baz`, `foo {{ false }} baz`);

test(
  'string (single quote)',
  valid,
  `foo {{ 'string' }} baz`,
  `foo {{ 'string' }} baz`,
);

test(
  'string (double quote)',
  valid,
  `foo {{ "string" }} baz`,
  `foo {{ "string" }} baz`,
);

test('number', valid, `foo {{       123}} baz`, `foo {{ 123 }} baz`);

test('trimed tag', valid, `{{-"string"       -}}`, `{{- "string" -}}`);

test(
  'comment out (single line)',
  valid,
  `{{/*a comment        */ }}`,
  `{{ /* a comment */ }}`,
);

test(
  'comment out (multi line)',
  valid,
  `{{   /*

comment 1
  comment 2  
comment 3   
  
*/      }}`,
  `{{/*

comment 1
  comment 2  
comment 3   
  
*/}}`,
);

test('identifier', valid, '{{identifier  }}', '{{ identifier }}');

test(
  'identifier - dot notation',
  valid,
  `{{ident.prop}} {{ident['prop']}} {{ident[0]}} {{ident["a-b"]}}`,
  `{{ ident.prop }} {{ ident.prop }} {{ ident[0] }} {{ ident["a-b"] }}`,
);

test(
  'identifier - dot notation (nest)',
  valid,
  `{{ ident["nest1"]['nest2'].nest3["0"][1] }}`,
  `{{ ident.nest1.nest2.nest3["0"][1] }}`,
);

test(
  'call - no pipe',
  valid,
  `{{ fn   null   undefined false "str"   123 inputs["name"]}}`,
  `{{ fn null undefined false "str" 123 inputs.name }}`,
);

test(
  'call - pipe',
  valid,
  `{{arg   |fn1   |   fn2    "arg2"  123          }}`,
  `{{ arg | fn1 | fn2 "arg2" 123 }}`,
);
