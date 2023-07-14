import { expect, test, vitest } from 'vitest';
import {
  any,
  attempt,
  char,
  choice,
  concat,
  cut,
  diff,
  digit,
  eof,
  expected,
  label,
  list,
  many,
  many1,
  manyTill,
  map,
  not,
  option,
  peek,
  preceded,
  satisfy,
  string,
} from './combinators.js';
import { parseError } from './error.js';
import type { ParserTestEntry } from './test-utils.js';
import { parse, result } from './test-utils.js';
import { none, some } from './types.js';

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, []],
  ['error', 'b', 'b', 0, false, []],
  ['success', 'a', 'a', '', 1, true, []],
])('satisfy(c => c == "a") - %s %s', (...args) => {
  expect(
    parse(
      satisfy((c) => c === 'a'),
      args[1],
    ),
  ).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '', null, '', 0, false, []],
  ['error', 'a', 'a', 0, false, []],
])('eof - %s %s', (...args) => {
  expect(parse(eof, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, []],
  ['success', 'a', 'a', '', 1, true, []],
  ['success', 'foo', 'f', 'oo', 1, true, []],
])('any - %s %s', (...args) => {
  expect(parse(any, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('"a" expected', [0, 0])]],
  ['success', 'a', 'a', '', 1, true, []],
  [
    'error',
    'A',
    'A',
    0,
    false,
    [parseError('"a" expected but "A" found', [0, 0])],
  ],
  [
    'error',
    'foo',
    'foo',
    0,
    false,
    [parseError('"a" expected but "f" found', [0, 0])],
  ],
])('char("a") - %s %s', (...args) => {
  expect(parse(char('a'), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"a" expected', [0, 0]), parseError('msg', [0, 0])],
  ],
  ['success', 'a', 'a', '', 1, true, []],
  [
    'error',
    'A',
    'A',
    0,
    false,
    [
      parseError('"a" expected but "A" found', [0, 0]),
      parseError('msg', [0, 0]),
    ],
  ],
  [
    'error',
    'foo',
    'foo',
    0,
    false,
    [
      parseError('"a" expected but "f" found', [0, 0]),
      parseError('msg', [0, 0]),
    ],
  ],
])('label(char("a"), "msg") - %s %s', (...args) => {
  expect(parse(label(char('a'), 'msg'), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('msg', [0, 0])]],
  ['success', 'a', 'a', '', 1, true, []],
  ['error', 'A', 'A', 0, false, [parseError('msg', [0, 0])]],
  ['error', 'foo', 'foo', 0, false, [parseError('msg', [0, 0])]],
])('expected(char("a"), "msg") - %s %s', (...args) => {
  expect(parse(expected(char('a'), 'msg'), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, []],
  ['success', 'abc', 'a', 'abc', 0, false, []],
  ['error', 'foo', 'foo', 0, false, []],
])('peek(char("a")) - %s %s', (...args) => {
  expect(parse(peek(char('a')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['failure', '', '', 0, false, [parseError('"a" expected', [0, 0])]],
  ['success', 'abc', 'a', 'bc', 1, true, []],
  [
    'failure',
    'foo',
    'foo',
    0,
    false,
    [parseError('"a" expected but "f" found', [0, 0])],
  ],
])('cut(char("a")) - %s %s', (...args) => {
  expect(parse(cut(char('a')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"dog" expected ("d" expected)', [0, 0])],
  ],
  [
    'error',
    'donate',
    'nate',
    2,
    false,
    [parseError('"dog" expected ("g" expected but "n" found)', [0, 2])],
  ],
  [
    'error',
    'cat',
    'cat',
    0,
    false,
    [parseError('"dog" expected ("d" expected but "c" found)', [0, 0])],
  ],
  ['success', 'dog', 'dog', '', 3, true, []],
])('attempt(string("dog")) - %s %s', (...args) => {
  expect(parse(attempt(string('dog')), args[1])).toEqual(result(...args));
});

test('map', () => {
  const fn = vitest.fn((a) => a + a);
  const p = map(char('a'), fn);
  expect(parse(p, 'abc')).toEqual(
    result('success', 'abc', 'aa', 'bc', 1, true, []),
  );
  expect(fn).toBeCalledWith('a', [0, 0]);

  expect(parse(p, 'bc')).toEqual(
    result('error', 'bc', 'bc', 0, false, [
      parseError('"a" expected but "b" found', [0, 0]),
    ]),
  );
  expect(fn).toBeCalledTimes(1);
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('"a" expected', [0, 0])]],
  ['error', 'a', '', 1, true, [parseError('"b" expected', [1, 1])]],
  [
    'error',
    'b',
    'b',
    0,
    false,
    [parseError('"a" expected but "b" found', [0, 0])],
  ],
  ['success', 'abc', ['a', 'b'], 'c', 2, true, []],
])('concat([char("a"), char("b")]) - %s %s', (...args) => {
  expect(parse(concat([char('a'), char('b')]), args[1])).toEqual(
    result(...args),
  );
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('"a" expected', [0, 0])]],
  ['success', 'ab;', 'b', ';', 2, true, []],
  [
    'error',
    'ba',
    'ba',
    0,
    false,
    [parseError('"a" expected but "b" found', [0, 0])],
  ],
])('preceded(char("a"), char("b")) - %s %s', (...args) => {
  const params = [
    args[0],
    args[0] === 'success' ? args[1].slice(1) : args[1],
    ...args.slice(2),
  ] as ParserTestEntry;

  expect(parse(preceded(char('a'), char('b')), args[1])).toEqual(
    result(...params),
  );
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, [parseError('"b" expected', [0, 0])]],
  ['success', 'abc', 'a', 'bc', 1, true, []],
  ['success', 'bc', 'b', 'c', 1, true, []],
  [
    'error',
    'c',
    'c',
    0,
    false,
    [parseError('"b" expected but "c" found', [0, 0])],
  ],
])('choice([char("a"), char("b")]) - %s %s', (...args) => {
  expect(parse(choice([char('a'), char('b')]), args[1])).toEqual(
    result(...args),
  );
});

test.each<ParserTestEntry>([
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('Expected a number from 0 to 9', [0, 0])],
  ],
  ['success', '012', '0', '12', 1, true, []],
  [
    'error',
    'foo',
    'foo',
    0,
    false,
    [parseError('Expected a number from 0 to 9', [0, 0])],
  ],
])('digit - %s %s', (...args) => {
  expect(parse(digit, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"dog" expected ("d" expected)', [0, 0])],
  ],
  [
    'error',
    'cat',
    'cat',
    0,
    false,
    [parseError('"dog" expected ("d" expected but "c" found)', [0, 0])],
  ],
  [
    'error',
    'd',
    '',
    1,
    true,
    [parseError('"dog" expected ("o" expected)', [0, 1])],
  ],
  [
    'error',
    'do',
    '',
    2,
    true,
    [parseError('"dog" expected ("g" expected)', [0, 2])],
  ],
  ['success', 'dogs', 'dog', 's', 3, true, []],
  [
    'error',
    'donate',
    'nate',
    2,
    true,
    [parseError('"dog" expected ("g" expected but "n" found)', [0, 2])],
  ],
])('string("dog") - %s %s', (...args) => {
  expect(parse(string('dog'), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '', none(), '', 0, false, []],
  ['success', 'dogs', some('dog'), 's', 3, true, []],
  [
    'error',
    'do',
    '',
    2,
    true,
    [parseError('"dog" expected ("g" expected)', [0, 2])],
  ],
])('option(string("dog")) - %s %s', (...args) => {
  expect(parse(option(string('dog')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '', null, '', 0, false, []],
  ['error', 'a', 'a', 0, false, []],
  ['success', 'A', null, 'A', 0, false, []],
  ['success', 'foo', null, 'foo', 0, false, []],
])('not(char("a")) - %s %s', (...args) => {
  expect(parse(not(char('a')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '123', '1', '23', 1, true, []],
  ['success', '543', '5', '43', 1, true, []],
  ['error', '0', '0', 0, false, []],
  [
    'error',
    'abc',
    'abc',
    0,
    false,
    [parseError('Expected a number from 0 to 9', [0, 0])],
  ],
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('Expected a number from 0 to 9', [0, 0])],
  ],
])('diff(digit, char("0")) - %s %s', (...args) => {
  expect(parse(diff(digit, char('0')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '', [], '', 0, false, []],
  ['success', 'a', ['a'], '', 1, true, []],
  ['success', 'aab', ['a', 'a'], 'b', 2, true, []],
  ['success', 'baa', [], 'baa', 0, false, []],
])('many(char("a")) - %s %s', (...args) => {
  expect(parse(many(char('a')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '', [], '', 0, false, []],
  ['success', 'dog', ['dog'], '', 3, true, []],
  ['success', 'dogdog', ['dog', 'dog'], '', 6, true, []],
  [
    'error',
    'dogdo',
    '',
    5,
    true,
    [parseError('"dog" expected ("g" expected)', [3, 5])],
  ],
])('many(string("dog")) - %s %s', (...args) => {
  expect(parse(many(string('dog')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['error', '', '', 0, false, []],
  ['error', 'b', 'b', 0, false, []],
  ['success', 'a', ['a'], '', 1, true, []],
  ['success', 'aab', ['a', 'a'], 'b', 2, true, []],
])('many1(char("a")) - %s %s', (...args) => {
  expect(parse(many1(char('a')), args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'abcabcend', [['abc', 'abc'], 'end'], '', 9, true, []],
  ['success', 'abcendefg', [['abc'], 'end'], 'efg', 6, true, []],
  [
    'error',
    'abc123end',
    '123end',
    3,
    true,
    [parseError('"abc" expected ("a" expected but "1" found)', [3, 3])],
  ],
  [
    'error',
    '123123end',
    '123123end',
    0,
    false,
    [parseError('"abc" expected ("a" expected but "1" found)', [0, 0])],
  ],
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"abc" expected ("a" expected)', [0, 0])],
  ],
])('manyTill(string("abc"), string("end")) - %s %s', (...args) => {
  expect(parse(manyTill(string('abc'), string('end')), args[1])).toEqual(
    result(...args),
  );
});

test.each<ParserTestEntry>([
  ['success', '1', ['1'], '', 1, true, []],
  ['success', '1,2,3', ['1', '2', '3'], '', 5, true, []],
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('Expected a number from 0 to 9', [0, 0])],
  ],
])('list(digit, char(",")) - %s %s', (...args) => {
  expect(parse(list(digit, char(',')), args[1])).toEqual(result(...args));
});
