import type { ExecutionContext } from 'ava';
import test from 'ava';
import type { TokenizeOptions } from './tokenize';
import { tokenize } from './tokenize';
import type { AnyToken } from './tokens';
import { createToken } from './tokens';

const valid =
  (options: Partial<TokenizeOptions> = {}) =>
  (t: ExecutionContext, input: string, expected: (AnyToken | null)[]) => {
    t.deepEqual(expected, tokenize(input, options));
  };

const invalid =
  (options: Partial<TokenizeOptions> = {}) =>
  (t: ExecutionContext, input: string) => {
    t.throws(() => {
      tokenize(input, options);
    });
  };

test('raw - true', valid(), 'true', [
  createToken(
    'STRING',
    { value: 'true', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 4 },
    },
  ),
]);

test('raw - false', valid(), 'false', [
  createToken(
    'STRING',
    { value: 'false', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 5 },
    },
  ),
]);

test('raw - null', valid(), 'null', [
  createToken(
    'STRING',
    { value: 'null', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 4 },
    },
  ),
]);

test('raw - undefined', valid(), 'undefined', [
  createToken(
    'STRING',
    { value: 'undefined', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 9 },
    },
  ),
]);

test('raw - string', valid(), 'foo', [
  createToken(
    'STRING',
    { value: 'foo', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    },
  ),
]);

test('raw - numeric', valid(), '123', [
  createToken(
    'STRING',
    { value: '123', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    },
  ),
]);

test('raw - incomplete open tag', valid(), '{ {', [
  createToken(
    'STRING',
    { value: '{ {', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    },
  ),
]);

test('raw - incomplete close tag', valid(), '} }', [
  createToken(
    'STRING',
    { value: '} }', quote: '' },
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    },
  ),
]);

test('tag - empty', valid(), '{{}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 3 },
    end: { line: 1, column: 4 },
  }),
]);

test('tag - trimed open', valid(), '{{-  }}', [
  createToken('OPEN_TAG', '{{-', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 3 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 6 },
    end: { line: 1, column: 7 },
  }),
]);

test('tag - trimed close', valid(), '{{ -}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('CLOSE_TAG', '-}}', {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 6 },
  }),
]);

test('tag - trimed', valid(), '{{- -}}', [
  createToken('OPEN_TAG', '{{-', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 3 },
  }),
  createToken('CLOSE_TAG', '-}}', {
    start: { line: 1, column: 5 },
    end: { line: 1, column: 7 },
  }),
]);

test('tag - identifier', valid(), '{{ identifier }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('IDENT', 'identifier', {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 13 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 15 },
    end: { line: 1, column: 16 },
  }),
]);

test(
  'tag - identifier and dot notation (string)',
  valid(),
  '{{ identifier.prop }}',
  [
    createToken('OPEN_TAG', '{{', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 2 },
    }),
    createToken('IDENT', 'identifier', {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 13 },
    }),
    createToken('DOT', '.', {
      start: { line: 1, column: 14 },
      end: { line: 1, column: 14 },
    }),
    createToken('IDENT', 'prop', {
      start: { line: 1, column: 15 },
      end: { line: 1, column: 18 },
    }),
    createToken('CLOSE_TAG', '}}', {
      start: { line: 1, column: 20 },
      end: { line: 1, column: 21 },
    }),
  ],
);

test(
  'tag - identifier and dot notation (number)',
  invalid(),
  '{{ identifier.0 }}',
);

test(
  'tag - identifier and bracket accessor (string)',
  valid(),
  `{{ identifier["prop"] }}{{ident['prop']}}`,
  [
    createToken('OPEN_TAG', '{{', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 2 },
    }),
    createToken('IDENT', 'identifier', {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 13 },
    }),
    createToken('OPEN_BRACKET', '[', {
      start: { line: 1, column: 14 },
      end: { line: 1, column: 14 },
    }),
    createToken(
      'STRING',
      { value: 'prop', quote: '"' },
      {
        start: { line: 1, column: 15 },
        end: { line: 1, column: 20 },
      },
    ),
    createToken('CLOSE_BRACKET', ']', {
      start: { line: 1, column: 21 },
      end: { line: 1, column: 21 },
    }),
    createToken('CLOSE_TAG', '}}', {
      start: { line: 1, column: 23 },
      end: { line: 1, column: 24 },
    }),
    createToken('OPEN_TAG', '{{', {
      start: { line: 1, column: 25 },
      end: { line: 1, column: 26 },
    }),
    createToken('IDENT', 'ident', {
      start: { line: 1, column: 27 },
      end: { line: 1, column: 31 },
    }),
    createToken('OPEN_BRACKET', '[', {
      start: { line: 1, column: 32 },
      end: { line: 1, column: 32 },
    }),
    createToken(
      'STRING',
      { value: 'prop', quote: "'" },
      {
        start: { line: 1, column: 33 },
        end: { line: 1, column: 38 },
      },
    ),
    createToken('CLOSE_BRACKET', ']', {
      start: { line: 1, column: 39 },
      end: { line: 1, column: 39 },
    }),
    createToken('CLOSE_TAG', '}}', {
      start: { line: 1, column: 40 },
      end: { line: 1, column: 41 },
    }),
  ],
);

test('tag - comment out', valid(), '{{/*a comment*/ }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('COMMENT', 'a comment', {
    start: { line: 1, column: 3 },
    end: { line: 1, column: 15 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 17 },
    end: { line: 1, column: 18 },
  }),
]);

test('tag - pipe', valid(), '{{ foo|   bar }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('IDENT', 'foo', {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 6 },
  }),
  createToken('PIPE', '|', {
    start: { line: 1, column: 7 },
    end: { line: 1, column: 7 },
  }),
  createToken('IDENT', 'bar', {
    start: { line: 1, column: 11 },
    end: { line: 1, column: 13 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 15 },
    end: { line: 1, column: 16 },
  }),
]);

test('tag - true', valid(), '{{true}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('BOOLEAN', true, {
    start: { line: 1, column: 3 },
    end: { line: 1, column: 6 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 7 },
    end: { line: 1, column: 8 },
  }),
]);

test('tag - false', valid(), '{{  false}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('BOOLEAN', false, {
    start: { line: 1, column: 5 },
    end: { line: 1, column: 9 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 10 },
    end: { line: 1, column: 11 },
  }),
]);

test('tag - null', valid(), '{{ null }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NULL', null, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 7 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 9 },
    end: { line: 1, column: 10 },
  }),
]);

test('tag - undefined', valid(), '{{undefined }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('UNDEFINED', undefined, {
    start: { line: 1, column: 3 },
    end: { line: 1, column: 11 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 13 },
    end: { line: 1, column: 14 },
  }),
]);

test('tag - string (single quote)', valid(), "{{ 'string'}}", [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken(
    'STRING',
    { value: 'string', quote: "'" },
    {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 11 },
    },
  ),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 12 },
    end: { line: 1, column: 13 },
  }),
]);

test('tag - string (double quote)', valid(), '{{ "string"}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken(
    'STRING',
    { value: 'string', quote: '"' },
    {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 11 },
    },
  ),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 12 },
    end: { line: 1, column: 13 },
  }),
]);

test('tag - string (includes tag keyword)', valid(), `{{ "{{ 'foo' }}" }}`, [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken(
    'STRING',
    {
      quote: `"`,
      value: `{{ 'foo' }}`,
    },
    {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 16 },
    },
  ),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 18 },
    end: { line: 1, column: 19 },
  }),
]);

test('tag - number (natural)', valid(), '{{ 123 }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NUMBER', 123, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 6 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 8 },
    end: { line: 1, column: 9 },
  }),
]);

test('tag - number (float)', valid(), '{{ 123.456}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NUMBER', 123.456, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 10 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 11 },
    end: { line: 1, column: 12 },
  }),
]);

test('tag - number (positive)', valid(), '{{ +123 }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NUMBER', 123, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 7 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 9 },
    end: { line: 1, column: 10 },
  }),
]);

test('tag - number (negative)', valid(), '{{ -123 }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NUMBER', -123, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 7 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 9 },
    end: { line: 1, column: 10 },
  }),
]);

test('tag - number (negative float)', valid(), '{{ -0.12}}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NUMBER', -0.12, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 8 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 9 },
    end: { line: 1, column: 10 },
  }),
]);

test('tag - number (hex)', valid(), '{{ 0xF }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('NUMBER', 15, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 6 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 8 },
    end: { line: 1, column: 9 },
  }),
]);

test(
  'tag - custom empty',
  valid({
    tags: ['<%=', '=%>'],
  }),
  '<%==%>',
  [
    createToken('OPEN_TAG', '<%=', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    }),
    createToken('CLOSE_TAG', '=%>', {
      start: { line: 1, column: 4 },
      end: { line: 1, column: 6 },
    }),
  ],
);

test(
  'tag - custom string',
  valid({
    tags: ['<%=', '=%>'],
  }),
  '<%= "{{}}" =%>',
  [
    createToken('OPEN_TAG', '<%=', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    }),
    createToken(
      'STRING',
      { value: '{{}}', quote: '"' },
      {
        start: { line: 1, column: 5 },
        end: { line: 1, column: 10 },
      },
    ),
    createToken('CLOSE_TAG', '=%>', {
      start: { line: 1, column: 12 },
      end: { line: 1, column: 14 },
    }),
  ],
);

test(
  'tag - custom trimed open',
  valid({
    tags: ['<%=', '=%>'],
  }),
  '<%=-  =%>',
  [
    createToken('OPEN_TAG', '<%=-', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 4 },
    }),
    createToken('CLOSE_TAG', '=%>', {
      start: { line: 1, column: 7 },
      end: { line: 1, column: 9 },
    }),
  ],
);

test(
  'tag - custom trimed close',
  valid({
    tags: ['<%=', '=%>'],
  }),
  '<%= -=%>',
  [
    createToken('OPEN_TAG', '<%=', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    }),
    createToken('CLOSE_TAG', '-=%>', {
      start: { line: 1, column: 5 },
      end: { line: 1, column: 8 },
    }),
  ],
);

test(
  'tag - custom trimed',
  valid({
    tags: ['<%=', '=%>'],
  }),
  '<%=- -=%>',
  [
    createToken('OPEN_TAG', '<%=-', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 4 },
    }),
    createToken('CLOSE_TAG', '-=%>', {
      start: { line: 1, column: 6 },
      end: { line: 1, column: 9 },
    }),
  ],
);

test('tag - unclosing', invalid(), '{{ foo "bar"');
test('tag - unopening', invalid(), 'foo bar }}');
test('tag - duplicate opening 1', invalid(), '{{ {{');
test('tag - duplicate opening 2', invalid(), '{{ {{ }}');

test('complex', valid(), '{{ foo | bar "hoge" | 123 | null }}', [
  createToken('OPEN_TAG', '{{', {
    start: { line: 1, column: 1 },
    end: { line: 1, column: 2 },
  }),
  createToken('IDENT', 'foo', {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 6 },
  }),
  createToken('PIPE', '|', {
    start: { line: 1, column: 8 },
    end: { line: 1, column: 8 },
  }),
  createToken('IDENT', 'bar', {
    start: { line: 1, column: 10 },
    end: { line: 1, column: 12 },
  }),
  createToken(
    'STRING',
    { value: 'hoge', quote: '"' },
    {
      start: { line: 1, column: 14 },
      end: { line: 1, column: 19 },
    },
  ),
  createToken('PIPE', '|', {
    start: { line: 1, column: 21 },
    end: { line: 1, column: 21 },
  }),
  createToken('NUMBER', 123, {
    start: { line: 1, column: 23 },
    end: { line: 1, column: 25 },
  }),
  createToken('PIPE', '|', {
    start: { line: 1, column: 27 },
    end: { line: 1, column: 27 },
  }),
  createToken('NULL', null, {
    start: { line: 1, column: 29 },
    end: { line: 1, column: 32 },
  }),
  createToken('CLOSE_TAG', '}}', {
    start: { line: 1, column: 34 },
    end: { line: 1, column: 35 },
  }),
]);

test(
  'complex - custom',
  valid({
    tags: ['<%=', '=%>'],
  }),
  '<%= foo | bar "hoge" | 123 | null =%>',
  [
    createToken('OPEN_TAG', '<%=', {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 3 },
    }),
    createToken('IDENT', 'foo', {
      start: { line: 1, column: 5 },
      end: { line: 1, column: 7 },
    }),
    createToken('PIPE', '|', {
      start: { line: 1, column: 9 },
      end: { line: 1, column: 9 },
    }),
    createToken('IDENT', 'bar', {
      start: { line: 1, column: 11 },
      end: { line: 1, column: 13 },
    }),
    createToken(
      'STRING',
      { value: 'hoge', quote: '"' },
      {
        start: { line: 1, column: 15 },
        end: { line: 1, column: 20 },
      },
    ),
    createToken('PIPE', '|', {
      start: { line: 1, column: 22 },
      end: { line: 1, column: 22 },
    }),
    createToken('NUMBER', 123, {
      start: { line: 1, column: 24 },
      end: { line: 1, column: 26 },
    }),
    createToken('PIPE', '|', {
      start: { line: 1, column: 28 },
      end: { line: 1, column: 28 },
    }),
    createToken('NULL', null, {
      start: { line: 1, column: 30 },
      end: { line: 1, column: 33 },
    }),
    createToken('CLOSE_TAG', '=%>', {
      start: { line: 1, column: 35 },
      end: { line: 1, column: 37 },
    }),
  ],
);
