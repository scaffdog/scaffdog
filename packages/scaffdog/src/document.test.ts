import test from 'ava';
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

test('parseDocument - valid (partial)', (t) => {
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

  t.deepEqual(result, {
    ...createPartialDocument('path'),
    templates: [
      {
        filename: 'title.txt',
        content: 'content',
      },
    ],
  });
});

test('parseDocument - valid (multiple output)', (t) => {
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

  t.deepEqual(result, {
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

test('parseDocument - valid (full)', (t) => {
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
---
`.trim(),
  );

  t.deepEqual(result, {
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
    },
  });
});

test('parseDocument - invalid', (t) => {
  t.throws(() =>
    parseDocument(
      'path',
      `
---
key: 'value'
---
`.trim(),
    ),
  );
});
