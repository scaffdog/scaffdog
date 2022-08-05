import { expect, test } from 'vitest';
import {
  createBooleanLiteral,
  createNullLiteral,
  createNumericLiteral,
  createStringLiteral,
  createTag,
  createUndefinedLiteral,
} from '../ast';
import { parseError } from './error';
import {
  booleanLiteral,
  literal,
  nullLiteral,
  numericLiteral,
  stringLiteral,
  tagClose,
  tagOpen,
  undefinedLiteral,
} from './literals';
import type { ParserTestEntry } from './test-utils';
import { parse, result } from './test-utils';

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('null literal expected', [0, 0])]],
  [
    'error',
    'true',
    'true',
    0,
    false,
    [parseError('null literal expected', [0, 0])],
  ],
  [
    'error',
    'nul',
    '',
    3,
    true,
    [parseError('"null" expected ("l" expected)', [0, 3])],
  ],
  ['success', 'null', createNullLiteral([0, 3]), '', 4, true, []],
])('nullLiteral - %s %s', (...args) => {
  expect(parse(nullLiteral, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('undefined literal expected', [0, 0])],
  ],
  [
    'error',
    'null',
    'null',
    0,
    false,
    [parseError('undefined literal expected', [0, 0])],
  ],
  [
    'error',
    'undefine',
    '',
    8,
    true,
    [parseError('"undefined" expected ("d" expected)', [0, 8])],
  ],
  ['success', 'undefined', createUndefinedLiteral([0, 8]), '', 9, true, []],
])('undefinedLiteral - %s %s', (...args) => {
  expect(parse(undefinedLiteral, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('boolean literal expected', [0, 0])]],
  [
    'error',
    'null',
    'null',
    0,
    false,
    [parseError('boolean literal expected', [0, 0])],
  ],
  [
    'error',
    'trl',
    'l',
    2,
    true,
    [parseError('"true" expected ("u" expected but "l" found)', [0, 2])],
  ],
  ['success', 'true', createBooleanLiteral(true, [0, 3]), '', 4, true, []],
  ['success', 'false', createBooleanLiteral(false, [0, 4]), '', 5, true, []],
])('booleanLiteral - %s %s', (...args) => {
  expect(parse(booleanLiteral, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  // binary
  ['success', '0b01', createNumericLiteral(0b01, [0, 3]), '', 4, true, []],
  ['success', '0B01', createNumericLiteral(0b01, [0, 3]), '', 4, true, []],
  ['failure', '0b', '', 2, true, [parseError('Invalid binary digit', [2, 2])]],
  [
    'failure',
    '0b2',
    '2',
    2,
    true,
    [parseError('Invalid binary digit', [2, 2])],
  ],
  // octal
  ['success', '0o17', createNumericLiteral(0o17, [0, 3]), '', 4, true, []],
  ['success', '0O17', createNumericLiteral(0o17, [0, 3]), '', 4, true, []],
  ['failure', '0o', '', 2, true, [parseError('Invalid octal digit', [2, 2])]],
  ['failure', '0o8', '8', 2, true, [parseError('Invalid octal digit', [2, 2])]],
  // hex
  ['success', '0xaf12', createNumericLiteral(0xaf12, [0, 5]), '', 6, true, []],
  ['success', '0Xaf12', createNumericLiteral(0xaf12, [0, 5]), '', 6, true, []],
  ['failure', '0x', '', 2, true, [parseError('Invalid hex digit', [2, 2])]],
  ['failure', '0xg', 'g', 2, true, [parseError('Invalid hex digit', [2, 2])]],
  // decimal
  ['success', '.12', createNumericLiteral(0.12, [0, 2]), '', 3, true, []],
  ['success', '.0', createNumericLiteral(0, [0, 1]), '', 2, true, []],
  ['success', '.1e+5', createNumericLiteral(0.1e5, [0, 4]), '', 5, true, []],
  [
    'failure',
    '.1e',
    '',
    3,
    true,
    [parseError('Invalid exponent part', [3, 3])],
  ],
  ['error', '.', '.', 0, false, []],
  ['success', '123.', createNumericLiteral(123, [0, 3]), '', 4, true, []],
  ['success', '123.0', createNumericLiteral(123, [0, 4]), '', 5, true, []],
  [
    'success',
    '123.4e+5',
    createNumericLiteral(123.4e5, [0, 7]),
    '',
    8,
    true,
    [],
  ],
  [
    'failure',
    '123.4e',
    '',
    6,
    true,
    [parseError('Invalid exponent part', [6, 6])],
  ],
  ['success', '123', createNumericLiteral(123, [0, 2]), '', 3, true, []],
  ['success', '123e+4', createNumericLiteral(123e4, [0, 5]), '', 6, true, []],
  [
    'failure',
    '123e',
    '',
    4,
    true,
    [parseError('Invalid exponent part', [4, 4])],
  ],
])('numericLiteral - %s %s', (...args) => {
  expect(parse(numericLiteral, args[1])).toEqual(result(...args));
});

/* eslint-disable no-useless-escape */
test.each<ParserTestEntry>([
  [
    'success',
    `"hello"`,
    createStringLiteral('hello', `"`, [0, 6]),
    '',
    7,
    true,
    [],
  ],
  [
    'success',
    `"foo\\.bar"`,
    createStringLiteral('foo\\.bar', `"`, [0, 9]),
    '',
    10,
    true,
    [],
  ],
  [
    'success',
    `"foo\\"bar"`,
    createStringLiteral('foo"bar', `"`, [0, 9]),
    '',
    10,
    true,
    [],
  ],
  [
    'success',
    `"\\ud83c\\udf63"`,
    createStringLiteral('\\ud83c\\udf63', `"`, [0, 13]),
    '',
    14,
    true,
    [],
  ],
  [
    'success',
    `'hello'`,
    createStringLiteral('hello', `'`, [0, 6]),
    '',
    7,
    true,
    [],
  ],
  [
    'success',
    `'foo\\'bar'`,
    createStringLiteral("foo'bar", `'`, [0, 9]),
    '',
    10,
    true,
    [],
  ],
  [
    'failure',
    `"foo`,
    '',
    4,
    true,
    [parseError('Missing double quote', [4, 4])],
  ],
  [
    'failure',
    `'foo`,
    '',
    4,
    true,
    [parseError('Missing single quote', [4, 4])],
  ],
])('stringLiteral - %s %s', (...args) => {
  expect(parse(stringLiteral, args[1])).toEqual(result(...args));
});
/* eslint-enable no-useless-escape */

test.each<ParserTestEntry>([
  ['success', 'null', createNullLiteral([0, 3]), '', 4, true, []],
  ['success', 'undefined', createUndefinedLiteral([0, 8]), '', 9, true, []],
  ['success', 'false', createBooleanLiteral(false, [0, 4]), '', 5, true, []],
  ['success', 'true', createBooleanLiteral(true, [0, 3]), '', 4, true, []],
  ['success', '123', createNumericLiteral(123, [0, 2]), '', 3, true, []],
  [
    'success',
    '"dog"',
    createStringLiteral('dog', `"`, [0, 4]),
    '',
    5,
    true,
    [],
  ],
])('literal - %s %s', (...args) => {
  expect(parse(literal, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '{{', createTag('open', '{{', false, [0, 1]), '', 2, true, []],
  ['success', '{{-', createTag('open', '{{', true, [0, 2]), '', 3, true, []],
  [
    'error',
    '}}',
    '}}',
    0,
    false,
    [parseError('"{{" expected ("{" expected but "}" found)', [0, 0])],
  ],
])('tagOpen - %s %s', (...args) => {
  expect(parse(tagOpen, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '}}', createTag('close', '}}', false, [0, 1]), '', 2, true, []],
  ['success', '-}}', createTag('close', '}}', true, [0, 2]), '', 3, true, []],
  [
    'error',
    '{{',
    '{{',
    0,
    false,
    [parseError('"}}" expected ("}" expected but "{" found)', [0, 0])],
  ],
])('tagClose - %s %s', (...args) => {
  expect(parse(tagClose, args[1])).toEqual(result(...args));
});
