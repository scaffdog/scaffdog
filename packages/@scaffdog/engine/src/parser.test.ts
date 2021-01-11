import type { ExecutionContext } from 'ava';
import test from 'ava';
import { Parser } from './parser';
import { tokenize } from './tokenize';

const parse = (input: string) => {
  const parser = new Parser(tokenize(input), input);
  const ast = parser.parse();

  return ast.map((node) => node.toString()).join('');
};

const valid = (t: ExecutionContext, input: string, expected: string) => {
  t.is(parse(input), expected);
};

const invalid = (t: ExecutionContext, input: string) => {
  t.throws(() => {
    parse(input);
  });
};

/**
 * basic
 */
test('raw', valid, 'foo/bar.ts', 'foo/bar.ts');

test('null', valid, '{{ null }}', '{{ null }}');

test('undefined', valid, '{{ undefined }}', '{{ undefined }}');

test('true', valid, '{{ true }}', '{{ true }}');

test('false', valid, '{{ false }}', '{{ false }}');

test('string', valid, '{{ "str" }}', '{{ "str" }}');

test('number', valid, '{{ 123 }}', '{{ 123 }}');

test('trimed tag', valid, '{{-"str"       -}}', '{{- "str" -}}');

test('comment out', valid, '{{ /*a comment*/ }}', '{{  }}');

test('identifier', valid, '{{ identifier }}', '{{ identifier }}');

test(
  'identifier - dot notation',
  valid,
  '{{ identifier.prop }}',
  '{{ identifier["prop"] }}',
);

test(
  'identifier - dot notation (nest)',
  valid,
  '{{ identifier.nest1.nest2 }} {{ identifier.nest1.nest2.nest3 }}',
  '{{ identifier["nest1"]["nest2"] }} {{ identifier["nest1"]["nest2"]["nest3"] }}',
);

test(
  'identifier - dot notation (invalid with unexpected)',
  invalid,
  '{{ identifier.foo. }}',
);

test(
  'identifier - dot notation (invalid with number)',
  invalid,
  '{{ identifier.1 }}',
);

test(
  'identifier - bracket accesor',
  valid,
  `{{ identifier[ident] }} {{ identifier['prop'] }} {{ identifier[0] }}`,
  '{{ identifier[ident] }} {{ identifier["prop"] }} {{ identifier[0] }}',
);

test(
  'identifier - bracket accesor (nest)',
  valid,
  `{{ identifier[nest1][nest2] }} {{ identifier['nest1']["nest2"] }} {{ identifier[0][1] }}`,
  '{{ identifier[nest1][nest2] }} {{ identifier["nest1"]["nest2"] }} {{ identifier[0][1] }}',
);

test(
  'identifier - bracket accessor (expr)',
  valid,
  '{{ identifier[nest["key"]] }} {{ identifier[nest.key] }}',
  '{{ identifier[nest["key"]] }} {{ identifier[nest["key"]] }}',
);

/**
 * call
 */
test('call - null', valid, '{{ fn null}}', '{{ fn(null) }}');

test('call - undefined', valid, '{{ fn undefined}}', '{{ fn(undefined) }}');

test('call - true', valid, '{{ fn true}}', '{{ fn(true) }}');

test('call - false', valid, '{{ fn false}}', '{{ fn(false) }}');

test('call - string', valid, '{{ fn "str" }}', '{{ fn("str") }}');

test('call - number', valid, '{{ fn 123}}', '{{ fn(123) }}');

test('call - identifier', valid, '{{ fn input }}', '{{ fn(input) }}');

test(
  'call - multiple arguments',
  valid,
  '{{ fn 123 "string" null input }}',
  '{{ fn(123, "string", null, input) }}',
);

/**
 * pipe call
 */
test(
  'pipe call - 0 arguments',
  valid,
  '{{ identifier | fn }}',
  '{{ fn(identifier) }}',
);

test(
  'pipe call - 1 arguments',
  valid,
  '{{ identifier | fn "str" }}',
  '{{ fn(identifier, "str") }}',
);

test(
  'pipe call - 2 arguments',
  valid,
  '{{ identifier | fn1 | fn2 "str" }}',
  '{{ fn2(fn1(identifier), "str") }}',
);

test(
  'pipe call - 3 arguments',
  valid,
  '{{ identifier | fn1 | fn2 "str" | fn3 123 }}',
  '{{ fn3(fn2(fn1(identifier), "str"), 123) }}',
);

/**
 * complex
 */
test(
  'complex',
  valid,
  'path/{{fn 1 2 3}}{{foo}}/{{- key | fn1 5 | fn2 "../" }}.ts',
  'path/{{ fn(1, 2, 3) }}{{ foo }}/{{- fn2(fn1(key, 5), "../") }}.ts',
);
