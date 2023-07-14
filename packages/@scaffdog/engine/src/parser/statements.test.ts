import { expect, test } from 'vitest';
import {
  createBinaryExpression,
  createBooleanLiteral,
  createBreakStatement,
  createCallExpression,
  createComment,
  createContinueStatement,
  createEndStatement,
  createExpressionStatement,
  createForStatement,
  createIdentifier,
  createIfStatement,
  createMemberExpression,
  createNumericLiteral,
  createParenthesizedExpression,
  createRawTemplate,
  createStringLiteral,
  createTag,
  createTagTemplate,
  createUnaryExpression,
  createVariableStatement,
} from '../ast.js';
import { parseError } from './error.js';
import {
  breakStatement,
  continueStatement,
  endStatement,
  expressionStatement,
  forStatement,
  ifStatement,
  rawTemplate,
  tagTemplate,
  variableStatement,
} from './statements.js';
import type { ParserTestEntry } from './test-utils.js';
import { parse, result } from './test-utils.js';

test.each<ParserTestEntry>([
  ['success', 'end', createEndStatement([0, 2]), '', 3, true, []],
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"end" expected ("e" expected)', [0, 0])],
  ],
])('endStatement - %s %s', (...args) => {
  expect(parse(endStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'continue', createContinueStatement([0, 7]), '', 8, true, []],
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"continue" expected ("c" expected)', [0, 0])],
  ],
])('continueStatement - %s %s', (...args) => {
  expect(parse(continueStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  ['success', 'break', createBreakStatement([0, 4]), '', 5, true, []],
  [
    'error',
    '',
    '',
    0,
    false,
    [parseError('"break" expected ("b" expected)', [0, 0])],
  ],
])('breakStatement - %s %s', (...args) => {
  expect(parse(breakStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    'a := b',
    createVariableStatement(
      createIdentifier('a', [0, 0]),
      createIdentifier('b', [5, 5]),
    ),
    '',
    6,
    true,
    [],
  ],
  [
    'success',
    'a /* c1 */ := /* c2 */ b',
    createVariableStatement(
      createIdentifier('a', [0, 0], [], [createComment(' c1 ', [2, 9])]),
      createIdentifier('b', [23, 23], [createComment(' c2 ', [14, 21])]),
    ),
    '',
    24,
    true,
    [],
  ],
  [
    'failure',
    'a :=',
    '',
    4,
    true,
    [parseError('Missing expression after ":="', [4, 4])],
  ],
  [
    'error',
    'a = b',
    '= b',
    2,
    true,
    [parseError('":=" expected (":" expected but "=" found)', [2, 2])],
  ],
])('variableStatement - %s %s', (...args) => {
  expect(parse(variableStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    'if true }}{{ end',
    createIfStatement(
      createBooleanLiteral(true, [3, 6]),
      [],
      null,
      {
        ifClose: createTag('close', '}}', false, [8, 9]),
        elseOpen: null,
        elseClose: null,
        endOpen: createTag('open', '{{', false, [10, 11]),
      },
      [0, 15],
    ),
    '',
    16,
    true,
    [],
  ],
  [
    'success',
    'if true }}{{ else }}{{ end',
    createIfStatement(
      createBooleanLiteral(true, [3, 6]),
      [],
      [],
      {
        ifClose: createTag('close', '}}', false, [8, 9]),
        elseOpen: createTag('open', '{{', false, [10, 11]),
        elseClose: createTag('close', '}}', false, [18, 19]),
        endOpen: createTag('open', '{{', false, [20, 21]),
      },
      [0, 25],
    ),
    '',
    26,
    true,
    [],
  ],
  [
    'success',
    'if true }}{{ else if cond }}{{ else }}{{ end',
    createIfStatement(
      createBooleanLiteral(true, [3, 6]),
      [],
      createIfStatement(
        createIdentifier('cond', [21, 24]),
        [],
        [],
        {
          ifClose: createTag('close', '}}', false, [26, 27]),
          elseOpen: createTag('open', '{{', false, [28, 29]),
          elseClose: createTag('close', '}}', false, [36, 37]),
          endOpen: createTag('open', '{{', false, [38, 39]),
        },
        [18, 43],
      ),
      {
        ifClose: createTag('close', '}}', false, [8, 9]),
        elseOpen: createTag('open', '{{', false, [10, 11]),
        elseClose: null,
        endOpen: null,
      },
      [0, 43],
    ),
    '',
    44,
    true,
    [],
  ],
  [
    'success',
    'if /*a*/ true /*b*/}}{{/*c*/ else /*d*/ if false /*e*/}}{{ /*f*/ end',
    createIfStatement(
      createBooleanLiteral(
        true,
        [9, 12],
        [createComment('a', [3, 7])],
        [createComment('b', [14, 18])],
      ),
      [],
      createIfStatement(
        createBooleanLiteral(
          false,
          [43, 47],
          [],
          [createComment('e', [49, 53])],
        ),
        [],
        null,
        {
          ifClose: createTag('close', '}}', false, [54, 55]),
          elseOpen: null,
          elseClose: null,
          endOpen: createTag(
            'open',
            '{{',
            false,
            [56, 57],
            [],
            [createComment('f', [59, 63])],
          ),
        },
        [40, 67],
        [createComment('d', [34, 38])],
      ),
      {
        ifClose: createTag('close', '}}', false, [19, 20]),
        elseOpen: createTag(
          'open',
          '{{',
          false,
          [21, 22],
          [createComment('c', [23, 27])],
        ),
        elseClose: null,
        endOpen: null,
      },
      [0, 67],
    ),
    '',
    68,
    true,
    [],
  ],
  [
    'success',
    'if true}}a{{else if false}}b{{ else}}c{{ end',
    createIfStatement(
      createBooleanLiteral(true, [3, 6]),
      [createRawTemplate('a', [9, 9])],
      createIfStatement(
        createBooleanLiteral(false, [20, 24]),
        [createRawTemplate('b', [27, 27])],
        [createRawTemplate('c', [37, 37])],
        {
          ifClose: createTag('close', '}}', false, [25, 26]),
          elseOpen: createTag('open', '{{', false, [28, 29]),
          elseClose: createTag('close', '}}', false, [35, 36]),
          endOpen: createTag('open', '{{', false, [38, 39]),
        },
        [17, 43],
      ),
      {
        ifClose: createTag('close', '}}', false, [7, 8]),
        elseOpen: createTag('open', '{{', false, [10, 11]),
        elseClose: null,
        endOpen: null,
      },
      [0, 43],
    ),
    '',
    44,
    true,
    [],
  ],
  [
    'failure',
    'if ',
    '',
    3,
    true,
    [parseError('Missing expression after "if" keyword', [3, 3])],
  ],
  ['failure', 'if true', '', 7, true, [parseError('Missing "}}"', [7, 7])]],
  // TODO more error cases
])('ifStatement - %s %s', (...args) => {
  expect(parse(ifStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    'for v in expr }}{{ end',
    createForStatement(
      createIdentifier('v', [4, 4]),
      null,
      createIdentifier('expr', [9, 12]),
      [],
      {
        close: createTag('close', '}}', false, [14, 15]),
        open: createTag('open', '{{', false, [16, 17]),
      },
      [0, 21],
    ),
    '',
    22,
    true,
    [],
  ],
  [
    'success',
    'for v in expr }}loop{{ end',
    createForStatement(
      createIdentifier('v', [4, 4]),
      null,
      createIdentifier('expr', [9, 12]),
      [createRawTemplate('loop', [16, 19])],
      {
        close: createTag('close', '}}', false, [14, 15]),
        open: createTag('open', '{{', false, [20, 21]),
      },
      [0, 25],
    ),
    '',
    26,
    true,
    [],
  ],
  [
    'success',
    'for v, i in expr }}{{ end',
    createForStatement(
      createIdentifier('v', [4, 4]),
      createIdentifier('i', [7, 7]),
      createIdentifier('expr', [12, 15]),
      [],
      {
        close: createTag('close', '}}', false, [17, 18]),
        open: createTag('open', '{{', false, [19, 20]),
      },
      [0, 24],
    ),
    '',
    25,
    true,
    [],
  ],
  [
    'success',
    'for /*a*/ v /*b*/ in /*c*/ expr /*d*/ }}{{ /*e*/ end',
    createForStatement(
      createIdentifier(
        'v',
        [10, 10],
        [createComment('a', [4, 8])],
        [createComment('b', [12, 16])],
      ),
      null,
      createIdentifier(
        'expr',
        [27, 30],
        [createComment('c', [21, 25])],
        [createComment('d', [32, 36])],
      ),
      [],
      {
        close: createTag('close', '}}', false, [38, 39]),
        open: createTag(
          'open',
          '{{',
          false,
          [40, 41],
          [],
          [createComment('e', [43, 47])],
        ),
      },
      [0, 51],
    ),
    '',
    52,
    true,
    [],
  ],
  [
    'success',
    'for /*a*/ v /*b*/, /*c*/ i /*d*/ in /*e*/ expr /*f*/ }}{{ /*g*/ end',
    createForStatement(
      createIdentifier(
        'v',
        [10, 10],
        [createComment('a', [4, 8])],
        [createComment('b', [12, 16])],
      ),
      createIdentifier(
        'i',
        [25, 25],
        [createComment('c', [19, 23])],
        [createComment('d', [27, 31])],
      ),
      createIdentifier(
        'expr',
        [42, 45],
        [createComment('e', [36, 40])],
        [createComment('f', [47, 51])],
      ),
      [],
      {
        close: createTag('close', '}}', false, [53, 54]),
        open: createTag(
          'open',
          '{{',
          false,
          [55, 56],
          [],
          [createComment('g', [58, 62])],
        ),
      },
      [0, 66],
    ),
    '',
    67,
    true,
    [],
  ],
  [
    'failure',
    'for ',
    '',
    4,
    true,
    [parseError('Missing expression after "for" keyword', [4, 4])],
  ],
  [
    'failure',
    'for v',
    '',
    5,
    true,
    [parseError('"in" expected after expression', [5, 5])],
  ],
  [
    'failure',
    'for v in',
    '',
    8,
    true,
    [parseError('Missing expression after for ~ in', [8, 8])],
  ],
  [
    'failure',
    'for v in expr',
    '',
    13,
    true,
    [parseError('Missing "}}"', [13, 13])],
  ],
  [
    'failure',
    'for v in expr }}loop',
    '',
    20,
    true,
    [
      parseError('"{{" expected ("{" expected)', [20, 20]),
      parseError('Missing "{{ end }}" after for statement', [16, 20]),
    ],
  ],
])('forStatement - %s %s', (...args) => {
  expect(parse(forStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    '1 + 2',
    createExpressionStatement(
      createBinaryExpression(
        createNumericLiteral(1, [0, 0]),
        '+',
        createNumericLiteral(2, [4, 4]),
      ),
    ),
    '',
    5,
    true,
    [],
  ],
])('expressionStatement - %s %s', (...args) => {
  expect(parse(expressionStatement, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    '{{}}',
    createTagTemplate(
      createTag('open', '{{', false, [0, 1]),
      null,
      createTag('close', '}}', false, [2, 3]),
    ),
    '',
    4,
    true,
    [],
  ],
  [
    'success',
    '{{--}}',
    createTagTemplate(
      createTag('open', '{{', true, [0, 2]),
      null,
      createTag('close', '}}', true, [3, 5]),
    ),
    '',
    6,
    true,
    [],
  ],
  [
    'success',
    '{{ /*a*/ }}',
    createTagTemplate(
      createTag('open', '{{', false, [0, 1]),
      null,
      createTag('close', '}}', false, [9, 10]),
      [createComment('a', [3, 7])],
    ),
    '',
    11,
    true,
    [],
  ],
  [
    'success',
    '{{ inputs.name }}',
    createTagTemplate(
      createTag('open', '{{', false, [0, 1]),
      createExpressionStatement(
        createMemberExpression(
          createIdentifier('inputs', [3, 8]),
          createIdentifier('name', [10, 13]),
          false,
        ),
      ),
      createTag('close', '}}', false, [15, 16]),
    ),
    '',
    17,
    true,
    [],
  ],
  [
    'success',
    '{{- -1 -}}',
    createTagTemplate(
      createTag('open', '{{', true, [0, 2]),
      createExpressionStatement(
        createUnaryExpression('-', createNumericLiteral(1, [5, 5])),
      ),
      createTag('close', '}}', true, [7, 9]),
    ),
    '',
    10,
    true,
    [],
  ],
  [
    'success',
    '{{/*a*/ (/*b*/ ident /*c*/) /*d*/}}',
    createTagTemplate(
      createTag('open', '{{', false, [0, 1]),
      createExpressionStatement(
        createParenthesizedExpression(
          createIdentifier(
            'ident',
            [15, 19],
            [],
            [createComment('c', [21, 25])],
          ),
          [8, 26],
          [createComment('b', [9, 13])],
          [createComment('d', [28, 32])],
        ),
      ),
      createTag('close', '}}', false, [33, 34]),
      [createComment('a', [2, 6])],
    ),
    '',
    35,
    true,
    [],
  ],
  [
    'success',
    '{{ for v in a }}{{ break }}{{ end }}',
    createTagTemplate(
      createTag('open', '{{', false, [0, 1]),
      createForStatement(
        createIdentifier('v', [7, 7]),
        null,
        createIdentifier('a', [12, 12]),
        [
          createTagTemplate(
            createTag('open', '{{', false, [16, 17]),
            createBreakStatement([19, 23]),
            createTag('close', '}}', false, [25, 26]),
          ),
        ],
        {
          close: createTag('close', '}}', false, [14, 15]),
          open: createTag('open', '{{', false, [27, 28]),
        },
        [3, 32],
      ),
      createTag('close', '}}', false, [34, 35]),
    ),
    '',
    36,
    true,
    [],
  ],
  [
    'success',
    '{{ fn1 "a" "b"}}',
    createTagTemplate(
      createTag('open', '{{', false, [0, 1]),
      createExpressionStatement(
        createCallExpression(
          createIdentifier('fn1', [3, 5]),
          [
            createStringLiteral('a', `"`, [7, 9]),
            createStringLiteral('b', `"`, [11, 13]),
          ],
          true,
          [3, 13],
        ),
      ),
      createTag('close', '}}', false, [14, 15]),
    ),
    '',
    16,
    true,
    [],
  ],
  ['error', '{{ a', '', 4, true, [parseError('Missing "}}"', [4, 4])]],
])('tagTemplate - %s %s', (...args) => {
  expect(parse(tagTemplate, args[1])).toEqual(result(...args));
});

test.each<ParserTestEntry>([
  [
    'success',
    '#123abc_🍣',
    createRawTemplate('#123abc_🍣', [0, 8]),
    '',
    9,
    true,
    [],
  ],
  ['success', '-}}{-{', createRawTemplate('-}}{-{', [0, 5]), '', 6, true, []],
  ['success', 'abc{{', createRawTemplate('abc', [0, 2]), '{{', 3, true, []],
  ['error', '{{', '{{', 0, false, []],
  ['error', '', '', 0, false, []],
])('rawTemplate - %s %s', (...args) => {
  expect(parse(rawTemplate, args[1])).toEqual(result(...args));
});
