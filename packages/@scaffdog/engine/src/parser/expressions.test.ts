import { expect, test } from 'vitest';
import {
  createBinaryExpression,
  createBooleanLiteral,
  createCallExpression,
  createComment,
  createConditionalExpression,
  createIdentifier,
  createLogicalExpression,
  createMemberExpression,
  createNumericLiteral,
  createParenthesizedExpression,
  createStringLiteral,
  createUnaryExpression,
  createUpdateExpression,
} from '../ast';
import { parseError } from './error';
import {
  additiveExpression,
  callExpression,
  conditionalExpression,
  equalityExpression,
  expression,
  identifier,
  logicalANDExpression,
  logicalORExpression,
  memberExpression,
  multiplicativeExpression,
  parenthesizedExpression,
  pipeExpression,
  relationalExpression,
  unaryExpression,
  updateExpression,
} from './expressions';
import type { ParserTestEntry } from './test-utils';
import { parse, result } from './test-utils';

test.each<ParserTestEntry>([
  ['success', 'a', createIdentifier('a', [0, 0]), '', 1, true, []],
  ['success', 'var14', createIdentifier('var14', [0, 4]), '', 5, true, []],
  ['success', '$var', createIdentifier('$var', [0, 3]), '', 4, true, []],
  ['success', '_foo', createIdentifier('_foo', [0, 3]), '', 4, true, []],
  ['success', '_', createIdentifier('_', [0, 0]), '', 1, true, []],
  ['success', '$_', createIdentifier('$_', [0, 1]), '', 2, true, []],
  ['success', 'iff', createIdentifier('iff', [0, 2]), '', 3, true, []],
  ['success', 'nulll', createIdentifier('nulll', [0, 4]), '', 5, true, []],
  ['error', '', '', 0, false, [parseError('Invalid identifier name', [0, 0])]],
  [
    'error',
    '#foo',
    '#foo',
    0,
    false,
    [parseError('Invalid identifier name', [0, 0])],
  ],
  [
    'error',
    'null',
    '',
    4,
    false,
    [
      parseError(
        '"null" is a reserved word and cannot be used as an identifier',
        [0, 3],
      ),
    ],
  ],
  [
    'error',
    'undefined',
    '',
    9,
    false,
    [
      parseError(
        '"undefined" is a reserved word and cannot be used as an identifier',
        [0, 8],
      ),
    ],
  ],
  [
    'error',
    'true',
    '',
    4,
    false,
    [
      parseError(
        '"true" is a reserved word and cannot be used as an identifier',
        [0, 3],
      ),
    ],
  ],
  [
    'error',
    'false',
    '',
    5,
    false,
    [
      parseError(
        '"false" is a reserved word and cannot be used as an identifier',
        [0, 4],
      ),
    ],
  ],
  [
    'error',
    'if',
    '',
    2,
    false,
    [
      parseError(
        '"if" is a reserved word and cannot be used as an identifier',
        [0, 1],
      ),
    ],
  ],
  [
    'error',
    'else',
    '',
    4,
    false,
    [
      parseError(
        '"else" is a reserved word and cannot be used as an identifier',
        [0, 3],
      ),
    ],
  ],
  [
    'error',
    'break',
    '',
    5,
    false,
    [
      parseError(
        '"break" is a reserved word and cannot be used as an identifier',
        [0, 4],
      ),
    ],
  ],
  [
    'error',
    'continue',
    '',
    8,
    false,
    [
      parseError(
        '"continue" is a reserved word and cannot be used as an identifier',
        [0, 7],
      ),
    ],
  ],
  [
    'error',
    'end',
    '',
    3,
    false,
    [
      parseError(
        '"end" is a reserved word and cannot be used as an identifier',
        [0, 2],
      ),
    ],
  ],
  [
    'error',
    'for',
    '',
    3,
    false,
    [
      parseError(
        '"for" is a reserved word and cannot be used as an identifier',
        [0, 2],
      ),
    ],
  ],
])('identifier - %s %s', (...args) => {
  expect(parse(identifier, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'obj', createIdentifier('obj', [0, 2]), '', 3, true, []],
  [
    'success',
    'obj.key',
    createMemberExpression(
      createIdentifier('obj', [0, 2]),
      createIdentifier('key', [4, 6]),
      false,
    ),
    '',
    7,
    true,
    [],
  ],
  [
    'success',
    'obj.nest1.nest2',
    createMemberExpression(
      createMemberExpression(
        createIdentifier('obj', [0, 2]),
        createIdentifier('nest1', [4, 8]),
        false,
      ),
      createIdentifier('nest2', [10, 14]),
      false,
    ),
    '',
    15,
    true,
    [],
  ],
  [
    'success',
    'obj.3',
    createMemberExpression(
      createIdentifier('obj', [0, 2]),
      createNumericLiteral(3, [4, 4]),
      false,
    ),
    '',
    5,
    true,
    [],
  ],
  [
    'failure',
    'obj.',
    '',
    4,
    true,
    [parseError('Missing member property', [4, 4])],
  ],
  ['failure', 'obj.0x', '', 6, true, [parseError('Invalid hex digit', [6, 6])]],
  [
    'success',
    'obj[/*a*/a /*b*/]',
    createMemberExpression(
      createIdentifier('obj', [0, 2]),
      createIdentifier(
        'a',
        [9, 9],
        [createComment('a', [4, 8])],
        [createComment('b', [11, 15])],
      ),
      true,
    ),
    '',
    17,
    true,
    [],
  ],
  [
    'success',
    'obj[true ? 0 : 1].foo.bar["a"]',
    createMemberExpression(
      createMemberExpression(
        createMemberExpression(
          createMemberExpression(
            createIdentifier('obj', [0, 2]),
            createConditionalExpression(
              createBooleanLiteral(true, [4, 7]),
              createNumericLiteral(0, [11, 11]),
              createNumericLiteral(1, [15, 15]),
            ),
            true,
          ),
          createIdentifier('foo', [18, 20]),
          false,
        ),
        createIdentifier('bar', [22, 24]),
        false,
      ),
      createStringLiteral('a', `"`, [26, 28]),
      true,
    ),
    '',
    30,
    true,
    [],
  ],
  [
    'failure',
    'a[',
    '',
    2,
    true,
    [parseError('Missing expression after "["', [2, 2])],
  ],
  ['failure', 'a["foo"', '', 7, true, [parseError('Missing "]"', [7, 7])]],
])('memberExpression - %s %s', (...args) => {
  expect(parse(memberExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'a', createIdentifier('a', [0, 0]), '', 1, true, []],
  [
    'success',
    '++a',
    createUpdateExpression(createIdentifier('a', [2, 2]), '++', true),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    '--a',
    createUpdateExpression(createIdentifier('a', [2, 2]), '--', true),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    '++foo.bar',
    createUpdateExpression(
      createMemberExpression(
        createIdentifier('foo', [2, 4]),
        createIdentifier('bar', [6, 8]),
        false,
      ),
      '++',
      true,
    ),
    '',
    9,
    true,
    [],
  ],
  [
    'failure',
    '++',
    '',
    2,
    true,
    [parseError('Missing left-hand side expression', [2, 2])],
  ],
  [
    'success',
    'a++',
    createUpdateExpression(createIdentifier('a', [0, 0]), '++', false),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    'a--',
    createUpdateExpression(createIdentifier('a', [0, 0]), '--', false),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    'foo.bar++',
    createUpdateExpression(
      createMemberExpression(
        createIdentifier('foo', [0, 2]),
        createIdentifier('bar', [4, 6]),
        false,
      ),
      '++',
      false,
    ),
    '',
    9,
    true,
    [],
  ],
  [
    'failure',
    '--5',
    '',
    3,
    true,
    [
      parseError(
        'Invalid left-hand side expression in prefix operation',
        [0, 2],
      ),
    ],
  ],
  [
    'failure',
    '5++',
    '',
    3,
    true,
    [
      parseError(
        'Invalid left-hand side expression in prefix operation',
        [0, 2],
      ),
    ],
  ],
])('updateExpression - %s %s', (...args) => {
  expect(parse(updateExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10', createNumericLiteral(10, [0, 1]), '', 2, true, []],
  [
    'success',
    '+a',
    createUnaryExpression('+', createIdentifier('a', [1, 1])),
    '',
    2,
    true,
    [],
  ],
  [
    'success',
    '-+~!a',
    createUnaryExpression(
      '-',
      createUnaryExpression(
        '+',
        createUnaryExpression(
          '~',
          createUnaryExpression('!', createIdentifier('a', [4, 4])),
        ),
      ),
    ),
    '',
    5,
    true,
    [],
  ],
  [
    'success',
    '+5',
    createUnaryExpression('+', createNumericLiteral(5, [1, 1])),
    '',
    2,
    true,
    [],
  ],
  // TODO error cases
])('unaryExpression - %s %s', (...args) => {
  expect(parse(unaryExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    '5 * 10',
    createBinaryExpression(
      createNumericLiteral(5, [0, 0]),
      '*',
      createNumericLiteral(10, [4, 5]),
    ),
    '',
    6,
    true,
    [],
  ],
  [
    'success',
    '5 /*a*/ * /*b*/10 /*c*/ / /*d*/ 15/*e*/ % /*f*/ 20',
    createBinaryExpression(
      createBinaryExpression(
        createBinaryExpression(
          createNumericLiteral(5, [0, 0], [], [createComment('a', [2, 6])]),
          '*',
          createNumericLiteral(
            10,
            [15, 16],
            [createComment('b', [10, 14])],
            [createComment('c', [18, 22])],
          ),
        ),
        '/',
        createNumericLiteral(
          15,
          [32, 33],
          [createComment('d', [26, 30])],
          [createComment('e', [34, 38])],
        ),
      ),
      '%',
      createNumericLiteral(20, [48, 49], [createComment('f', [42, 46])]),
    ),
    '',
    50,
    true,
    [],
  ],
  [
    'failure',
    '5 * ',
    '',
    4,
    true,
    [parseError('Missing right operand', [4, 4])],
  ],
])('multiplicativeExpression - %s %s', (...args) => {
  expect(parse(multiplicativeExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    '5 + 10',
    createBinaryExpression(
      createNumericLiteral(5, [0, 0]),
      '+',
      createNumericLiteral(10, [4, 5]),
    ),
    '',
    6,
    true,
    [],
  ],
  [
    'success',
    '5 + 10 - 15',
    createBinaryExpression(
      createBinaryExpression(
        createNumericLiteral(5, [0, 0]),
        '+',
        createNumericLiteral(10, [4, 5]),
      ),
      '-',
      createNumericLiteral(15, [9, 10]),
    ),
    '',
    11,
    true,
    [],
  ],
  [
    'success',
    '5/*a*/ + /*b*/ 10 /*c*/ * /*d*/15',
    createBinaryExpression(
      createNumericLiteral(5, [0, 0], [], [createComment('a', [1, 5])]),
      '+',
      createBinaryExpression(
        createNumericLiteral(10, [15, 16], [], [createComment('c', [18, 22])]),
        '*',
        createNumericLiteral(15, [31, 32], [createComment('d', [26, 30])]),
        [createComment('b', [9, 13])],
      ),
    ),
    '',
    33,
    true,
    [],
  ],
  [
    'failure',
    '5 + ',
    '',
    4,
    true,
    [parseError('Missing right operand', [4, 4])],
  ],
])('additiveExpression - %s %s', (...args) => {
  expect(parse(additiveExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    '1 /*a*/ < /*b*/2',
    createBinaryExpression(
      createNumericLiteral(1, [0, 0], [], [createComment('a', [2, 6])]),
      '<',
      createNumericLiteral(2, [15, 15], [createComment('b', [10, 14])]),
    ),
    '',
    16,
    true,
    [],
  ],
  [
    'success',
    '5 + 10 - 15',
    createBinaryExpression(
      createBinaryExpression(
        createNumericLiteral(5, [0, 0]),
        '+',
        createNumericLiteral(10, [4, 5]),
      ),
      '-',
      createNumericLiteral(15, [9, 10]),
    ),
    '',
    11,
    true,
    [],
  ],
  [
    'success',
    '5/*a*/ + /*b*/ 10 /*c*/ * /*d*/15',
    createBinaryExpression(
      createNumericLiteral(5, [0, 0], [], [createComment('a', [1, 5])]),
      '+',
      createBinaryExpression(
        createNumericLiteral(10, [15, 16], [], [createComment('c', [18, 22])]),
        '*',
        createNumericLiteral(15, [31, 32], [createComment('d', [26, 30])]),
        [createComment('b', [9, 13])],
      ),
    ),
    '',
    33,
    true,
    [],
  ],
  [
    'success',
    '1 > 2 < 3 >= 4 <= 5',
    createBinaryExpression(
      createBinaryExpression(
        createBinaryExpression(
          createBinaryExpression(
            createNumericLiteral(1, [0, 0]),
            '>',
            createNumericLiteral(2, [4, 4]),
          ),
          '<',
          createNumericLiteral(3, [8, 8]),
        ),
        '>=',
        createNumericLiteral(4, [13, 13]),
      ),
      '<=',
      createNumericLiteral(5, [18, 18]),
    ),
    '',
    19,
    true,
    [],
  ],
  [
    'failure',
    '5 < ',
    '',
    4,
    true,
    [parseError('Missing right operand', [4, 4])],
  ],
])('relationalExpression - %s %s', (...args) => {
  expect(parse(relationalExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    '1 /*a*/ == /*b*/2',
    createBinaryExpression(
      createNumericLiteral(1, [0, 0], [], [createComment('a', [2, 6])]),
      '==',
      createNumericLiteral(2, [16, 16], [createComment('b', [11, 15])]),
    ),
    '',
    17,
    true,
    [],
  ],
  [
    'success',
    '1 != 2 + 3 == 4',
    createBinaryExpression(
      createBinaryExpression(
        createNumericLiteral(1, [0, 0]),
        '!=',
        createBinaryExpression(
          createNumericLiteral(2, [5, 5]),
          '+',
          createNumericLiteral(3, [9, 9]),
        ),
      ),
      '==',
      createNumericLiteral(4, [14, 14]),
    ),
    '',
    15,
    true,
    [],
  ],
  [
    'failure',
    '5 ==',
    '',
    4,
    true,
    [parseError('Missing right operand', [4, 4])],
  ],
])('equalityExpression - %s %s', (...args) => {
  expect(parse(equalityExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    '1/*a*/ && /*b*/  2',
    createLogicalExpression(
      createNumericLiteral(1, [0, 0], [], [createComment('a', [1, 5])]),
      '&&',
      createNumericLiteral(2, [17, 17], [createComment('b', [10, 14])]),
    ),
    '',
    18,
    true,
    [],
  ],
  [
    'success',
    '1 && 2 && 3',
    createLogicalExpression(
      createLogicalExpression(
        createNumericLiteral(1, [0, 0]),
        '&&',
        createNumericLiteral(2, [5, 5]),
      ),
      '&&',
      createNumericLiteral(3, [10, 10]),
    ),
    '',
    11,
    true,
    [],
  ],
  [
    'failure',
    '5 &&',
    '',
    4,
    true,
    [parseError('Missing right operand', [4, 4])],
  ],
])('logicalANDExpression - %s %s', (...args) => {
  expect(parse(logicalANDExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    '1/*a*/ || /*b*/  2',
    createLogicalExpression(
      createNumericLiteral(1, [0, 0], [], [createComment('a', [1, 5])]),
      '||',
      createNumericLiteral(2, [17, 17], [createComment('b', [10, 14])]),
    ),
    '',
    18,
    true,
    [],
  ],
  [
    'success',
    '1 + 2 || 3 && 4',
    createLogicalExpression(
      createBinaryExpression(
        createNumericLiteral(1, [0, 0]),
        '+',
        createNumericLiteral(2, [4, 4]),
      ),
      '||',
      createLogicalExpression(
        createNumericLiteral(3, [9, 9]),
        '&&',
        createNumericLiteral(4, [14, 14]),
      ),
    ),
    '',
    15,
    true,
    [],
  ],
  [
    'failure',
    '5 &&',
    '',
    4,
    true,
    [parseError('Missing right operand', [4, 4])],
  ],
])('logicalORExpression - %s %s', (...args) => {
  expect(parse(logicalORExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', '10 ', createNumericLiteral(10, [0, 1]), ' ', 2, true, []],
  [
    'success',
    'true ? "foo" : "bar"',
    createConditionalExpression(
      createBooleanLiteral(true, [0, 3]),
      createStringLiteral('foo', `"`, [7, 11]),
      createStringLiteral('bar', `"`, [15, 19]),
    ),
    '',
    20,
    true,
    [],
  ],
  [
    'success',
    '1 /*a*/ ? /*b*/ 2 /*c*/ : /*d*/ 3',
    createConditionalExpression(
      createNumericLiteral(1, [0, 0], [], [createComment('a', [2, 6])]),
      createNumericLiteral(
        2,
        [16, 16],
        [createComment('b', [10, 14])],
        [createComment('c', [18, 22])],
      ),
      createNumericLiteral(3, [32, 32], [createComment('d', [26, 30])]),
    ),
    '',
    33,
    true,
    [],
  ],
  [
    'success',
    'a ? b ? c : d : e',
    createConditionalExpression(
      createIdentifier('a', [0, 0]),
      createConditionalExpression(
        createIdentifier('b', [4, 4]),
        createIdentifier('c', [8, 8]),
        createIdentifier('d', [12, 12]),
      ),
      createIdentifier('e', [16, 16]),
    ),
    '',
    17,
    true,
    [],
  ],
  ['failure', 'a ?', '', 3, true, [parseError('Missing expression', [3, 3])]],
  [
    'failure',
    'a ? b',
    '',
    5,
    true,
    [parseError('":" expected after expression', [5, 5])],
  ],
  [
    'failure',
    'a ? b :',
    '',
    7,
    true,
    [parseError('Missing expression after ":"', [7, 7])],
  ],
])('conditionalExpression - %s %s', (...args) => {
  expect(parse(conditionalExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    'a()',
    createCallExpression(createIdentifier('a', [0, 0]), [], false, [0, 2]),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    'a(1, 2 )',
    createCallExpression(
      createIdentifier('a', [0, 0]),
      [createNumericLiteral(1, [2, 2]), createNumericLiteral(2, [5, 5])],
      false,
      [0, 7],
    ),
    '',
    8,
    true,
    [],
  ],
  [
    'success',
    'a(1)(2)',
    createCallExpression(
      createCallExpression(
        createIdentifier('a', [0, 0]),
        [createNumericLiteral(1, [2, 2])],
        false,
        [0, 3],
      ),
      [createNumericLiteral(2, [5, 5])],
      false,
      [0, 6],
    ),
    '',
    7,
    true,
    [],
  ],
  [
    'success',
    'a(b(1))',
    createCallExpression(
      createIdentifier('a', [0, 0]),
      [
        createCallExpression(
          createIdentifier('b', [2, 2]),
          [createNumericLiteral(1, [4, 4])],
          false,
          [2, 5],
        ),
      ],
      false,
      [0, 6],
    ),
    '',
    7,
    true,
    [],
  ],
  [
    'success',
    'a( /*a*/  )',
    createCallExpression(
      createIdentifier('a', [0, 0]),
      [],
      false,
      [0, 10],
      [],
      [createComment('a', [3, 7])],
    ),
    '',
    11,
    true,
    [],
  ],
  [
    'success',
    'a(/*a*/1/*b*/, /*c*/2 /*d*/)',
    createCallExpression(
      createIdentifier('a', [0, 0]),
      [
        createNumericLiteral(
          1,
          [7, 7],
          [createComment('a', [2, 6])],
          [createComment('b', [8, 12])],
        ),
        createNumericLiteral(
          2,
          [20, 20],
          [createComment('c', [15, 19])],
          [createComment('d', [22, 26])],
        ),
      ],
      false,
      [0, 27],
    ),
    '',
    28,
    true,
    [],
  ],
  [
    'success',
    'a().b',
    createMemberExpression(
      createCallExpression(createIdentifier('a', [0, 0]), [], false, [0, 2]),
      createIdentifier('b', [4, 4]),
      false,
    ),
    '',
    5,
    true,
    [],
  ],
  [
    'success',
    'a()[b()().c["d"]]',
    createMemberExpression(
      createCallExpression(createIdentifier('a', [0, 0]), [], false, [0, 2]),
      createMemberExpression(
        createMemberExpression(
          createCallExpression(
            createCallExpression(
              createIdentifier('b', [4, 4]),
              [],
              false,
              [4, 6],
            ),
            [],
            false,
            [4, 8],
          ),
          createIdentifier('c', [10, 10]),
          false,
        ),
        createStringLiteral('d', `"`, [12, 14]),
        true,
      ),
      true,
    ),
    '',
    17,
    true,
    [],
  ],
  [
    'failure',
    'a(',
    '',
    2,
    true,
    [parseError('Missing ")" after function call', [2, 2])],
  ],
  [
    'failure',
    'a(1',
    '',
    3,
    true,
    [parseError('Missing ")" after function call', [3, 3])],
  ],
  // FIXME improve error messages
  [
    'failure',
    'a(1,',
    '1,',
    2,
    true,
    [parseError('Missing ")" after function call', [2, 2])],
  ],
  [
    'failure',
    'a()[',
    '',
    4,
    true,
    [parseError('Missing expression after "["', [4, 4])],
  ],
  ['failure', 'a()[0', '', 5, true, [parseError('Missing "]"', [5, 5])]],
])('callExpression - %s %s', (...args) => {
  expect(parse(callExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'a', createIdentifier('a', [0, 0]), '', 1, true, []],
  [
    'success',
    'a | b',
    createCallExpression(
      createIdentifier('b', [4, 4]),
      [createIdentifier('a', [0, 0])],
      true,
      [0, 4],
    ),
    '',
    5,
    true,
    [],
  ],
  [
    'success',
    'fn "a" 10 -5',
    createCallExpression(
      createIdentifier('fn', [0, 1]),
      [
        createStringLiteral('a', `"`, [3, 5]),
        createNumericLiteral(10, [7, 8]),
        createUnaryExpression('-', createNumericLiteral(5, [11, 11])),
      ],
      true,
      [0, 11],
    ),
    '',
    12,
    true,
    [],
  ],
  [
    'success',
    'a /*a*/ | /*b*/ b',
    createCallExpression(
      createIdentifier('b', [16, 16], [createComment('b', [10, 14])]),
      [createIdentifier('a', [0, 0], [], [createComment('a', [2, 6])])],
      true,
      [0, 16],
    ),
    '',
    17,
    true,
    [],
  ],
  [
    'success',
    'a | b | c "d"',
    createCallExpression(
      createIdentifier('c', [8, 8]),
      [
        createCallExpression(
          createIdentifier('b', [4, 4]),
          [createIdentifier('a', [0, 0])],
          true,
          [0, 4],
        ),
        createStringLiteral('d', `"`, [10, 12]),
      ],
      true,
      [0, 12],
    ),
    '',
    13,
    true,
    [],
  ],
  [
    'error',
    '1 |',
    '',
    3,
    true,
    [parseError('Missing argument after pipe delimiter', [3, 3])],
  ],
])('pipeExpression - %s %s', (...args) => {
  expect(parse(pipeExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    '(a)',
    createParenthesizedExpression(createIdentifier('a', [1, 1]), [0, 2]),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    '(1 * ( 2 + 3 ))',
    createParenthesizedExpression(
      createBinaryExpression(
        createNumericLiteral(1, [1, 1]),
        '*',
        createParenthesizedExpression(
          createBinaryExpression(
            createNumericLiteral(2, [7, 7]),
            '+',
            createNumericLiteral(3, [11, 11]),
          ),
          [5, 13],
        ),
      ),
      [0, 14],
    ),
    '',
    15,
    true,
    [],
  ],
  [
    'success',
    '(/*a*/ true /*b*/)',
    createParenthesizedExpression(
      createBooleanLiteral(true, [7, 10], [], [createComment('b', [12, 16])]),
      [0, 17],
      [createComment('a', [1, 5])],
    ),
    '',
    18,
    true,
    [],
  ],
  [
    'failure',
    '(true',
    '',
    5,
    true,
    [parseError('Missing ")" after expression', [5, 5])],
  ],
])('parenthesizedExpression - %s %s', (...args) => {
  expect(parse(parenthesizedExpression, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'a', createIdentifier('a', [0, 0]), '', 1, true, []],
  [
    'success',
    'fn(ident + 1)',
    createCallExpression(
      createIdentifier('fn', [0, 1]),
      [
        createBinaryExpression(
          createIdentifier('ident', [3, 7]),
          '+',
          createNumericLiteral(1, [11, 11]),
        ),
      ],
      false,
      [0, 12],
    ),
    '',
    13,
    true,
    [],
  ],
  [
    'success',
    '-1',
    createUnaryExpression('-', createNumericLiteral(1, [1, 1])),
    '',
    2,
    true,
    [],
  ],
  [
    'success',
    '++a',
    createUpdateExpression(createIdentifier('a', [2, 2]), '++', true),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    '-+a',
    createUnaryExpression(
      '-',
      createUnaryExpression('+', createIdentifier('a', [2, 2])),
    ),
    '',
    3,
    true,
    [],
  ],
  [
    'success',
    'a != "b" ? c : d | e 10',
    createCallExpression(
      createIdentifier('e', [19, 19]),
      [
        createConditionalExpression(
          createBinaryExpression(
            createIdentifier('a', [0, 0]),
            '!=',
            createStringLiteral('b', `"`, [5, 7]),
          ),
          createIdentifier('c', [11, 11]),
          createIdentifier('d', [15, 15]),
        ),
        createNumericLiteral(10, [21, 22]),
      ],
      true,
      [0, 22],
    ),
    '',
    23,
    true,
    [],
  ],
])('expression - %s %s', (...args) => {
  expect(parse(expression, args[1])).toEqual(result(...args));
});
