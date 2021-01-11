import type { ExecutionContext } from 'ava';
import test from 'ava';
import { tokenize } from './tokenize';
import type { AnyToken } from './tokens';
import { createToken } from './tokens';

const valid = (
  t: ExecutionContext,
  input: string,
  expected: (AnyToken | null)[],
) => {
  t.deepEqual(expected, tokenize(input));
};

const invalid = (t: ExecutionContext, input: string) => {
  t.throws(() => {
    tokenize(input);
  });
};

test('raw - true', valid, 'true', [
  createToken('STRING', 'true', { line: 1, column: 1 }, { line: 1, column: 4 }),
]);

test('raw - false', valid, 'false', [
  createToken(
    'STRING',
    'false',
    { line: 1, column: 1 },
    { line: 1, column: 5 },
  ),
]);

test('raw - null', valid, 'null', [
  createToken('STRING', 'null', { line: 1, column: 1 }, { line: 1, column: 4 }),
]);

test('raw - undefined', valid, 'undefined', [
  createToken(
    'STRING',
    'undefined',
    { line: 1, column: 1 },
    { line: 1, column: 9 },
  ),
]);

test('raw - string', valid, 'foo', [
  createToken('STRING', 'foo', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('raw - numeric', valid, '123', [
  createToken('STRING', '123', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('raw - incomplete open tag', valid, '{ {', [
  createToken('STRING', '{ {', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('raw - incomplete close tag', valid, '} }', [
  createToken('STRING', '} }', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('tag - empty', valid, '{{}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 3 },
    { line: 1, column: 4 },
  ),
]);

test('tag - trimed open', valid, '{{-  }}', [
  createToken(
    'OPEN_TAG',
    '{{-',
    { line: 1, column: 1 },
    { line: 1, column: 3 },
  ),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 6 },
    { line: 1, column: 7 },
  ),
]);

test('tag - trimed close', valid, '{{ -}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'CLOSE_TAG',
    '-}}',
    { line: 1, column: 4 },
    { line: 1, column: 6 },
  ),
]);

test('tag - trimed', valid, '{{- -}}', [
  createToken(
    'OPEN_TAG',
    '{{-',
    { line: 1, column: 1 },
    { line: 1, column: 3 },
  ),
  createToken(
    'CLOSE_TAG',
    '-}}',
    { line: 1, column: 5 },
    { line: 1, column: 7 },
  ),
]);

test('tag - identifier', valid, '{{ identifier }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'IDENT',
    'identifier',
    { line: 1, column: 4 },
    { line: 1, column: 13 },
  ),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 15 },
    { line: 1, column: 16 },
  ),
]);

test(
  'tag - identifier and dot notation (string)',
  valid,
  '{{ identifier.prop }}',
  [
    createToken(
      'OPEN_TAG',
      '{{',
      { line: 1, column: 1 },
      { line: 1, column: 2 },
    ),
    createToken(
      'IDENT',
      'identifier',
      { line: 1, column: 4 },
      { line: 1, column: 13 },
    ),
    createToken('DOT', '.', { line: 1, column: 14 }, { line: 1, column: 14 }),
    createToken(
      'IDENT',
      'prop',
      { line: 1, column: 15 },
      { line: 1, column: 18 },
    ),
    createToken(
      'CLOSE_TAG',
      '}}',
      { line: 1, column: 20 },
      { line: 1, column: 21 },
    ),
  ],
);

test(
  'tag - identifier and dot notation (number)',
  invalid,
  '{{ identifier.0 }}',
);

test(
  'tag - identifier and bracket accessor (string)',
  valid,
  `{{ identifier["prop"] }}{{ident['prop']}}`,
  [
    createToken(
      'OPEN_TAG',
      '{{',
      { line: 1, column: 1 },
      { line: 1, column: 2 },
    ),
    createToken(
      'IDENT',
      'identifier',
      { line: 1, column: 4 },
      { line: 1, column: 13 },
    ),
    createToken(
      'OPEN_BRACKET',
      '[',
      { line: 1, column: 14 },
      { line: 1, column: 14 },
    ),
    createToken(
      'STRING',
      'prop',
      { line: 1, column: 15 },
      { line: 1, column: 20 },
    ),
    createToken(
      'CLOSE_BRACKET',
      ']',
      { line: 1, column: 21 },
      { line: 1, column: 21 },
    ),
    createToken(
      'CLOSE_TAG',
      '}}',
      { line: 1, column: 23 },
      { line: 1, column: 24 },
    ),
    createToken(
      'OPEN_TAG',
      '{{',
      { line: 1, column: 25 },
      { line: 1, column: 26 },
    ),
    createToken(
      'IDENT',
      'ident',
      { line: 1, column: 27 },
      { line: 1, column: 31 },
    ),
    createToken(
      'OPEN_BRACKET',
      '[',
      { line: 1, column: 32 },
      { line: 1, column: 32 },
    ),
    createToken(
      'STRING',
      'prop',
      { line: 1, column: 33 },
      { line: 1, column: 38 },
    ),
    createToken(
      'CLOSE_BRACKET',
      ']',
      { line: 1, column: 39 },
      { line: 1, column: 39 },
    ),
    createToken(
      'CLOSE_TAG',
      '}}',
      { line: 1, column: 40 },
      { line: 1, column: 41 },
    ),
  ],
);

test('tag - comment out', valid, '{{/*a comment*/ }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 17 },
    { line: 1, column: 18 },
  ),
]);

test('tag - pipe', valid, '{{ foo|   bar }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('IDENT', 'foo', { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken('PIPE', '|', { line: 1, column: 7 }, { line: 1, column: 7 }),
  createToken('IDENT', 'bar', { line: 1, column: 11 }, { line: 1, column: 13 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 15 },
    { line: 1, column: 16 },
  ),
]);

test('tag - true', valid, '{{true}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('BOOLEAN', true, { line: 1, column: 3 }, { line: 1, column: 6 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 7 },
    { line: 1, column: 8 },
  ),
]);

test('tag - false', valid, '{{  false}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('BOOLEAN', false, { line: 1, column: 5 }, { line: 1, column: 9 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 10 },
    { line: 1, column: 11 },
  ),
]);

test('tag - null', valid, '{{ null }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('NULL', null, { line: 1, column: 4 }, { line: 1, column: 7 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 9 },
    { line: 1, column: 10 },
  ),
]);

test('tag - undefined', valid, '{{undefined }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'UNDEFINED',
    undefined,
    { line: 1, column: 3 },
    { line: 1, column: 11 },
  ),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 13 },
    { line: 1, column: 14 },
  ),
]);

test('tag - string (single quote)', valid, "{{ 'string'}}", [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'STRING',
    'string',
    { line: 1, column: 4 },
    { line: 1, column: 11 },
  ),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 12 },
    { line: 1, column: 13 },
  ),
]);

test('tag - string (double quote)', valid, '{{ "string"}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'STRING',
    'string',
    { line: 1, column: 4 },
    { line: 1, column: 11 },
  ),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 12 },
    { line: 1, column: 13 },
  ),
]);

test('tag - number (natural)', valid, '{{ 123 }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('NUMBER', 123, { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 8 },
    { line: 1, column: 9 },
  ),
]);

test('tag - number (float)', valid, '{{ 123.456}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(
    'NUMBER',
    123.456,
    { line: 1, column: 4 },
    { line: 1, column: 10 },
  ),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 11 },
    { line: 1, column: 12 },
  ),
]);

test('tag - number (positive)', valid, '{{ +123 }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('NUMBER', 123, { line: 1, column: 4 }, { line: 1, column: 7 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 9 },
    { line: 1, column: 10 },
  ),
]);

test('tag - number (negative)', valid, '{{ -123 }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('NUMBER', -123, { line: 1, column: 4 }, { line: 1, column: 7 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 9 },
    { line: 1, column: 10 },
  ),
]);

test('tag - number (negative float)', valid, '{{ -0.12}}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('NUMBER', -0.12, { line: 1, column: 4 }, { line: 1, column: 8 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 9 },
    { line: 1, column: 10 },
  ),
]);

test('tag - number (hex)', valid, '{{ 0xF }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('NUMBER', 15, { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 8 },
    { line: 1, column: 9 },
  ),
]);

test('tag - unclosing', invalid, '{{ foo "bar"');
test('tag - unopening', invalid, 'foo bar }}');
test('tag - duplicate opening 1', invalid, '{{ {{');
test('tag - duplicate opening 2', invalid, '{{ {{ }}');

test('complex', valid, '{{ foo | bar "hoge" | 123 | null }}', [
  createToken('OPEN_TAG', '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken('IDENT', 'foo', { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken('PIPE', '|', { line: 1, column: 8 }, { line: 1, column: 8 }),
  createToken('IDENT', 'bar', { line: 1, column: 10 }, { line: 1, column: 12 }),
  createToken(
    'STRING',
    'hoge',
    { line: 1, column: 14 },
    { line: 1, column: 19 },
  ),
  createToken('PIPE', '|', { line: 1, column: 21 }, { line: 1, column: 21 }),
  createToken('NUMBER', 123, { line: 1, column: 23 }, { line: 1, column: 25 }),
  createToken('PIPE', '|', { line: 1, column: 27 }, { line: 1, column: 27 }),
  createToken('NULL', null, { line: 1, column: 29 }, { line: 1, column: 32 }),
  createToken(
    'CLOSE_TAG',
    '}}',
    { line: 1, column: 34 },
    { line: 1, column: 35 },
  ),
]);
