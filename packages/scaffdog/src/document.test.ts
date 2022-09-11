import type { ExtractOptions } from '@scaffdog/core';
import { parse } from '@scaffdog/engine';
import { describe, expect, test } from 'vitest';
import { parseDocument } from './document';

const partial = `
---
name: 'name'
root: 'root'
output: 'output'
---
`.trim();

const createPartialDocument = (path: string) => ({
  path,
  name: 'name',
  root: 'root',
  output: 'output',
  variables: new Map(),
  templates: [],
});

const options: ExtractOptions = {};

describe('parseDocument', () => {
  test('valid (partial)', () => {
    const result = parseDocument(
      'path',
      `
${partial}

# title.txt

\`\`\`
content
\`\`\`
`.trim(),
      options,
    );

    expect(result).toEqual({
      ...createPartialDocument('path'),
      templates: [
        {
          filename: parse('title.txt', options),
          content: parse('content', options),
        },
      ],
    });
  });

  test('valid (multiple output)', () => {
    const result = parseDocument(
      'path',
      `
---
name: 'name'
root: 'root'
output: ['a', 'b']
---

# title.txt

\`\`\`
content
\`\`\`
`.trim(),
      options,
    );

    expect(result).toEqual({
      ...createPartialDocument('path'),
      output: ['a', 'b'],
      templates: [
        {
          filename: parse('title.txt', options),
          content: parse('content', options),
        },
      ],
    });
  });

  test('valid (full)', () => {
    const result = parseDocument(
      'path',
      `
---
name: 'name'
root: 'root'
output: 'output'
ignore: ['ignore']
questions:
  key1: 'message'
  key2:
    message: 'message'
  key3:
    message: 'message'
    initial: 'initial'
  key4:
    message: 'message'
    choices: ['1', '2']
  key5:
    message: 'message'
    choices: ['1', '2']
    initial: '2'
  key6:
    message: 'message'
    choices: ['1', '2']
    multiple: true
    initial: ['2']
  key7:
    message: 'message'
    if: true
  key8:
    message: 'message'
    if: len(inputs.key1) > 3
---
`.trim(),
      options,
    );

    expect(result).toEqual({
      ...createPartialDocument('path'),
      ignore: ['ignore'],
      questions: {
        key1: 'message',
        key2: {
          message: 'message',
        },
        key3: {
          message: 'message',
          initial: 'initial',
        },
        key4: {
          message: 'message',
          choices: ['1', '2'],
        },
        key5: {
          message: 'message',
          choices: ['1', '2'],
          initial: '2',
        },
        key6: {
          message: 'message',
          choices: ['1', '2'],
          multiple: true,
          initial: ['2'],
        },
        key7: {
          message: 'message',
          if: true,
        },
        key8: {
          message: 'message',
          if: 'len(inputs.key1) > 3',
        },
      },
    });
  });

  test('invalid', () => {
    expect(() =>
      parseDocument(
        'path',
        `
---
key: 'value'
---
`.trim(),
        options,
      ),
    ).toThrowError();
  });
});
