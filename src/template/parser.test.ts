import test, { ExecutionContext } from 'ava';
import { Parser } from './parser';
import { tokenize } from './tokenize';

const parse = (input: string) => {
  const parser = new Parser(tokenize(input));
  const ast = parser.parse();

  return ast.map((node) => node.toString()).join('');
};

const valid = (t: ExecutionContext, input: string, expected: string) => {
  t.is(parse(input), expected);
};

test('raw', valid, 'foo/bar.ts', 'foo/bar.ts');
test('null', valid, '{{ null }}', '{{ null }}');
test('undefined', valid, '{{ undefined }}', '{{ undefined }}');
test('true', valid, '{{ true }}', '{{ true }}');
test('false', valid, '{{ false }}', '{{ false }}');
test('string', valid, '{{ "str" }}', '{{ "str" }}');
test('number', valid, '{{ 123 }}', '{{ 123 }}');

test('comment out', valid, '{{ /*a comment*/ }}', '{{  }}');

test('identifier', valid, '{{ identifier }}', '{{ identifier }}');

test('call - null', valid, '{{ fn null}}', '{{ fn(null) }}');
test('call - undefined', valid, '{{ fn undefined}}', '{{ fn(undefined) }}');
test('call - true', valid, '{{ fn true}}', '{{ fn(true) }}');
test('call - false', valid, '{{ fn false}}', '{{ fn(false) }}');
test('call - string', valid, '{{ fn "str" }}', '{{ fn("str") }}');
test('call - number', valid, '{{ fn 123}}', '{{ fn(123) }}');
test('call - identifier', valid, '{{ fn input }}', '{{ fn(input) }}');
test('call - multiple arguments', valid, '{{ fn 123 "string" null input }}', '{{ fn(123, "string", null, input) }}');

test('pipe call - 0 arguments', valid, '{{ identifier | fn }}', '{{ fn(identifier) }}');
test('pipe call - 1 arguments', valid, '{{ identifier | fn "str" }}', '{{ fn(identifier, "str") }}');
test('pipe call - 2 arguments', valid, '{{ identifier | fn1 | fn2 "str" }}', '{{ fn2(fn1(identifier), "str") }}');
test(
  'pipe call - 3 arguments',
  valid,
  '{{ identifier | fn1 | fn2 "str" | fn3 123 }}',
  '{{ fn3(fn2(fn1(identifier), "str"), 123) }}',
);

test(
  'complex',
  valid,
  'path/{{fn 1 2 3}}{{foo}}/{{ key | fn1 5 | fn2 "../" }}.ts',
  'path/{{ fn(1, 2, 3) }}{{ foo }}/{{ fn2(fn1(key, 5), "../") }}.ts',
);
