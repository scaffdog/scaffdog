import test, { ExecutionContext } from 'ava';
import { tokenize } from './tokenize';
import { AnyToken, createToken, TokenType } from './tokens';

const valid = (t: ExecutionContext, input: string, expected: Array<AnyToken | null>) => {
  t.deepEqual(expected, tokenize(input));
};

const invalid = (t: ExecutionContext, input: string) => {
  t.throws(() => {
    tokenize(input);
  });
};

test('raw - true', valid, 'true', [
  createToken(TokenType.STRING, 'true', { line: 1, column: 1 }, { line: 1, column: 4 }),
]);

test('raw - false', valid, 'false', [
  createToken(TokenType.STRING, 'false', { line: 1, column: 1 }, { line: 1, column: 5 }),
]);

test('raw - null', valid, 'null', [
  createToken(TokenType.STRING, 'null', { line: 1, column: 1 }, { line: 1, column: 4 }),
]);

test('raw - undefined', valid, 'undefined', [
  createToken(TokenType.STRING, 'undefined', { line: 1, column: 1 }, { line: 1, column: 9 }),
]);

test('raw - string', valid, 'foo', [
  createToken(TokenType.STRING, 'foo', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('raw - numeric', valid, '123', [
  createToken(TokenType.STRING, '123', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('raw - incomplete open tag', valid, '{ {', [
  createToken(TokenType.STRING, '{ {', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('raw - incomplete close tag', valid, '} }', [
  createToken(TokenType.STRING, '} }', { line: 1, column: 1 }, { line: 1, column: 3 }),
]);

test('tag - empty', valid, '{{}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 3 }, { line: 1, column: 4 }),
]);

test('tag - trimed open', valid, '{{-  }}', [
  createToken(TokenType.OPEN_TAG, '{{-', { line: 1, column: 1 }, { line: 1, column: 3 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 6 }, { line: 1, column: 7 }),
]);

test('tag - trimed close', valid, '{{ -}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.CLOSE_TAG, '-}}', { line: 1, column: 4 }, { line: 1, column: 6 }),
]);

test('tag - trimed', valid, '{{- -}}', [
  createToken(TokenType.OPEN_TAG, '{{-', { line: 1, column: 1 }, { line: 1, column: 3 }),
  createToken(TokenType.CLOSE_TAG, '-}}', { line: 1, column: 5 }, { line: 1, column: 7 }),
]);

test('tag - identifier', valid, '{{ identifier }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.IDENT, 'identifier', { line: 1, column: 4 }, { line: 1, column: 13 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 15 }, { line: 1, column: 16 }),
]);

test('tag - comment out', valid, '{{/*a comment*/ }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 17 }, { line: 1, column: 18 }),
]);

test('tag - pipe', valid, '{{ foo|   bar }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.IDENT, 'foo', { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken(TokenType.PIPE, '|', { line: 1, column: 7 }, { line: 1, column: 7 }),
  createToken(TokenType.IDENT, 'bar', { line: 1, column: 11 }, { line: 1, column: 13 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 15 }, { line: 1, column: 16 }),
]);

test('tag - true', valid, '{{true}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.BOOLEAN, true, { line: 1, column: 3 }, { line: 1, column: 6 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 7 }, { line: 1, column: 8 }),
]);

test('tag - false', valid, '{{  false}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.BOOLEAN, false, { line: 1, column: 5 }, { line: 1, column: 9 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 10 }, { line: 1, column: 11 }),
]);

test('tag - null', valid, '{{ null }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NULL, null, { line: 1, column: 4 }, { line: 1, column: 7 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 9 }, { line: 1, column: 10 }),
]);

test('tag - undefined', valid, '{{undefined }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.UNDEFINED, undefined, { line: 1, column: 3 }, { line: 1, column: 11 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 13 }, { line: 1, column: 14 }),
]);

test('tag - string (single quote)', valid, "{{ 'string'}}", [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.STRING, 'string', { line: 1, column: 4 }, { line: 1, column: 11 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 12 }, { line: 1, column: 13 }),
]);

test('tag - string (double quote)', valid, '{{ "string"}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.STRING, 'string', { line: 1, column: 4 }, { line: 1, column: 11 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 12 }, { line: 1, column: 13 }),
]);

test('tag - number (natural)', valid, '{{ 123 }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NUMBER, 123, { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 8 }, { line: 1, column: 9 }),
]);

test('tag - number (float)', valid, '{{ 123.456}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NUMBER, 123.456, { line: 1, column: 4 }, { line: 1, column: 10 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 11 }, { line: 1, column: 12 }),
]);

test('tag - number (positive)', valid, '{{ +123 }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NUMBER, 123, { line: 1, column: 4 }, { line: 1, column: 7 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 9 }, { line: 1, column: 10 }),
]);

test('tag - number (negative)', valid, '{{ -123 }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NUMBER, -123, { line: 1, column: 4 }, { line: 1, column: 7 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 9 }, { line: 1, column: 10 }),
]);

test('tag - number (negative float)', valid, '{{ -0.12}}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NUMBER, -0.12, { line: 1, column: 4 }, { line: 1, column: 8 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 9 }, { line: 1, column: 10 }),
]);

test('tag - number (hex)', valid, '{{ 0xF }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.NUMBER, 15, { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 8 }, { line: 1, column: 9 }),
]);

test('tag - unclosing', invalid, '{{ foo "bar"');
test('tag - unopening', invalid, 'foo bar }}');
test('tag - duplicate opening 1', invalid, '{{ {{');
test('tag - duplicate opening 2', invalid, '{{ {{ }}');

test('complex', valid, '{{ foo | bar "hoge" | 123 | null }}', [
  createToken(TokenType.OPEN_TAG, '{{', { line: 1, column: 1 }, { line: 1, column: 2 }),
  createToken(TokenType.IDENT, 'foo', { line: 1, column: 4 }, { line: 1, column: 6 }),
  createToken(TokenType.PIPE, '|', { line: 1, column: 8 }, { line: 1, column: 8 }),
  createToken(TokenType.IDENT, 'bar', { line: 1, column: 10 }, { line: 1, column: 12 }),
  createToken(TokenType.STRING, 'hoge', { line: 1, column: 14 }, { line: 1, column: 19 }),
  createToken(TokenType.PIPE, '|', { line: 1, column: 21 }, { line: 1, column: 21 }),
  createToken(TokenType.NUMBER, 123, { line: 1, column: 23 }, { line: 1, column: 25 }),
  createToken(TokenType.PIPE, '|', { line: 1, column: 27 }, { line: 1, column: 27 }),
  createToken(TokenType.NULL, null, { line: 1, column: 29 }, { line: 1, column: 32 }),
  createToken(TokenType.CLOSE_TAG, '}}', { line: 1, column: 34 }, { line: 1, column: 35 }),
]);
