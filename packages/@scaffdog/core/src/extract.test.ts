import { expect, test } from 'vitest';
import { extract } from './extract';

test('basic', () => {
  expect(
    extract(`
# Variables

- key: value0
- key1: \`value1\`
- key2: \`{{ value2 }}\`
- key3: Hello \`{{ value3 }}\` !
- $key: value4
- _key: value5
- ignore variable: value
- 123ignore: value
- 123ignore: value

# \`basic.txt\`

\`\`\`typescript
// line 1
\`\`\`

> skip

# \`{{ using.variable }}.txt\`

ignore paragraph.

\`\`\`typescript
// line 1
// line 2
// line 3
\`\`\`

\`\`\`typescript
// ignore code block
\`\`\`

## ignore heading level 2

\`\`\`typescript
// code block...
\`\`\`
`),
  ).toEqual({
    variables: new Map([
      ['key', 'value0'],
      ['key1', 'value1'],
      ['key2', '{{ value2 }}'],
      ['key3', 'Hello {{ value3 }} !'],
      ['$key', 'value4'],
      ['_key', 'value5'],
    ]),
    templates: [
      {
        filename: 'basic.txt',
        content: `// line 1`,
      },
      {
        filename: '{{ using.variable }}.txt',
        content: `// line 1
// line 2
// line 3`,
      },
    ],
  });
});

test('without variables', () => {
  expect(
    extract(`
# filename

\`\`\`typescript
// code block
\`\`\`
`),
  ).toEqual({
    variables: new Map(),
    templates: [
      {
        filename: 'filename',
        content: `// code block`,
      },
    ],
  });
});
