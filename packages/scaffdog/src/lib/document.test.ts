import type { ExtractOptions } from '@scaffdog/core';
import { parse as sdParse } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import { parse } from './document.js';
import { createQuestionLibraryMock } from './question.mock';

const partial = `
---
name: 'name'
root: 'root'
output: 'output'
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

describe('parse', () => {
  test('valid (partial)', () => {
    const question = createQuestionLibraryMock({
      parse: vi.fn().mockReturnValueOnce(
        new Map([
          [
            'name',
            {
              type: 'input',
              message: 'msg1',
            },
          ],
        ]),
      ),
    });

    const result = parse(
      question,
      'path',
      `
${partial}
questions:
  name: 'msg1'
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
      questions: new Map([
        [
          'name',
          {
            type: 'input',
            message: 'msg1',
          },
        ],
      ]),
      templates: [
        {
          filename: sdParse('title.txt', options),
          content: sdParse('content', options),
        },
      ],
    });

    expect(question.parse).toBeCalledWith({
      name: 'msg1',
    });
  });

  test('valid (multiple output)', () => {
    const question = createQuestionLibraryMock({
      parse: vi.fn().mockReturnValueOnce(new Map()),
    });

    const result = parse(
      question,
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
      questions: new Map(),
      templates: [
        {
          filename: sdParse('title.txt', options),
          content: sdParse('content', options),
        },
      ],
    });
  });

  test('valid (full)', () => {
    const question = createQuestionLibraryMock({
      parse: vi.fn().mockReturnValueOnce(new Map()),
    });

    const result = parse(
      question,
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
      questions: new Map(),
    });

    expect(question.parse).toBeCalledWith({
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
    });
  });

  test('invalid', () => {
    const question = createQuestionLibraryMock({
      parse: vi.fn().mockReturnValueOnce(new Map()),
    });

    expect(() =>
      parse(
        question,
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
