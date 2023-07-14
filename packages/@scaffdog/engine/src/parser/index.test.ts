import type { TagPair } from '@scaffdog/types';
import { expect, test } from 'vitest';
import {
  createBinaryExpression,
  createExpressionStatement,
  createIdentifier,
  createNumericLiteral,
  createProgram,
  createRawTemplate,
  createTag,
  createTagTemplate,
} from '../ast.js';
import { defaults } from '../syntax.js';
import { parse } from '.';

test.each<[source: string, tags: TagPair, data: any]>([
  ['', defaults.tags, createProgram([], '')],
  [
    'abc',
    defaults.tags,
    createProgram([createRawTemplate('abc', [0, 2])], 'abc'),
  ],
  [
    '{{ a }}',
    defaults.tags,
    createProgram(
      [
        createTagTemplate(
          createTag('open', '{{', false, [0, 1]),
          createExpressionStatement(createIdentifier('a', [3, 3])),
          createTag('close', '}}', false, [5, 6]),
        ),
      ],
      '{{ a }}',
    ),
  ],
  [
    '{{a}}b{{c}}',
    defaults.tags,
    createProgram(
      [
        createTagTemplate(
          createTag('open', '{{', false, [0, 1]),
          createExpressionStatement(createIdentifier('a', [2, 2])),
          createTag('close', '}}', false, [3, 4]),
        ),
        createRawTemplate('b', [5, 5]),
        createTagTemplate(
          createTag('open', '{{', false, [6, 7]),
          createExpressionStatement(createIdentifier('c', [8, 8])),
          createTag('close', '}}', false, [9, 10]),
        ),
      ],
      '{{a}}b{{c}}',
    ),
  ],
  [
    '<% 1 % 2 %>',
    ['<%', '%>'],
    createProgram(
      [
        createTagTemplate(
          createTag('open', '<%', false, [0, 1]),
          createExpressionStatement(
            createBinaryExpression(
              createNumericLiteral(1, [3, 3]),
              '%',
              createNumericLiteral(2, [7, 7]),
            ),
          ),
          createTag('close', '%>', false, [9, 10]),
        ),
      ],
      '<% 1 % 2 %>',
    ),
  ],
  [
    '<%- 1 % 2 -%>',
    ['<%', '%>'],
    createProgram(
      [
        createTagTemplate(
          createTag('open', '<%', true, [0, 2]),
          createExpressionStatement(
            createBinaryExpression(
              createNumericLiteral(1, [4, 4]),
              '%',
              createNumericLiteral(2, [8, 8]),
            ),
          ),
          createTag('close', '%>', true, [10, 12]),
        ),
      ],
      '<%- 1 % 2 -%>',
    ),
  ],
  [
    '<= a =>',
    ['<=', '=>'],
    createProgram(
      [
        createTagTemplate(
          createTag('open', '<=', false, [0, 1]),
          createExpressionStatement(createIdentifier('a', [3, 3])),
          createTag('close', '=>', false, [5, 6]),
        ),
      ],
      '<= a =>',
    ),
  ],
])('parse success - %s', (source, tags, data) => {
  expect(parse(source, { tags })).toEqual(data);
});
