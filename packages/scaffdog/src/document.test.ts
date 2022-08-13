import { test, expect, describe } from 'vitest';
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
    );

    expect(result).toEqual({
      ...createPartialDocument('path'),
      templates: [
        {
          filename: 'title.txt',
          content: 'content',
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
    );

    expect(result).toEqual({
      ...createPartialDocument('path'),
      output: ['a', 'b'],
      templates: [
        {
          filename: 'title.txt',
          content: 'content',
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
---
`.trim(),
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
      ),
    ).toThrowError();
  });
});
