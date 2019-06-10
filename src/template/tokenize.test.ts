import test, { ExecutionContext } from 'ava';
import { tokenize } from './tokenize';
import { AnyToken, createToken, TokenType } from './tokens';

const valid = (t: ExecutionContext, input: string, expected: Array<AnyToken | null>) => {
  t.deepEqual(tokenize(input), expected);
};

const invalid = (t: ExecutionContext, input: string) => {
  t.throws(() => {
    tokenize(input);
  });
};

test('raw - true', valid, 'true', [createToken(TokenType.STRING, 'true')]);
test('raw - false', valid, 'false', [createToken(TokenType.STRING, 'false')]);
test('raw - null', valid, 'null', [createToken(TokenType.STRING, 'null')]);
test('raw - undefined', valid, 'undefined', [createToken(TokenType.STRING, 'undefined')]);
test('raw - string', valid, 'foo', [createToken(TokenType.STRING, 'foo')]);
test('raw - numeric', valid, '123', [createToken(TokenType.STRING, '123')]);
test('raw - incomplete open tag', valid, '{ {', [createToken(TokenType.STRING, '{ {')]);
test('raw - incomplete close tag', valid, '} }', [createToken(TokenType.STRING, '} }')]);

test('tag - empty', valid, '{{}}', [createToken(TokenType.OPEN_TAG, '{{'), createToken(TokenType.CLOSE_TAG, '}}')]);

test('tag - identifier', valid, '{{ identifier }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.IDENT, 'identifier'),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - comment out', valid, '{{/*a comment*/ }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - pipe', valid, '{{ foo|   bar }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.IDENT, 'foo'),
  createToken(TokenType.PIPE, '|'),
  createToken(TokenType.IDENT, 'bar'),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - true', valid, '{{true}}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.BOOLEAN, true),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - false', valid, '{{  false}}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.BOOLEAN, false),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - null', valid, '{{ null }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NULL, null),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - undefined', valid, '{{undefined }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.UNDEFINED, undefined),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - string (single quote)', valid, "{{ 'string'}}", [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.STRING, 'string'),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - string (double quote)', valid, '{{ "string"}}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.STRING, 'string'),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - number (natural)', valid, '{{ 123 }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NUMBER, 123),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - number (float)', valid, '{{ 123.456}}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NUMBER, 123.456),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - number (positive)', valid, '{{ +123 }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NUMBER, 123),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - number (negative)', valid, '{{ -123 }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NUMBER, -123),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - number (negative float)', valid, '{{ -0.12}}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NUMBER, -0.12),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - number (hex)', valid, '{{ 0xF }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.NUMBER, 15),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);

test('tag - unclosing', invalid, '{{ foo "bar"');
test('tag - unopening', invalid, 'foo bar }}');
test('tag - duplicate opening 1', invalid, '{{ {{');
test('tag - duplicate opening 2', invalid, '{{ {{ }}');

test('complex', valid, '{{ foo | bar "hoge" | 123 | null }}', [
  createToken(TokenType.OPEN_TAG, '{{'),
  createToken(TokenType.IDENT, 'foo'),
  createToken(TokenType.PIPE, '|'),
  createToken(TokenType.IDENT, 'bar'),
  createToken(TokenType.STRING, 'hoge'),
  createToken(TokenType.PIPE, '|'),
  createToken(TokenType.NUMBER, 123),
  createToken(TokenType.PIPE, '|'),
  createToken(TokenType.NULL, null),
  createToken(TokenType.CLOSE_TAG, '}}'),
]);
