import type { ParseOptions } from '@scaffdog/engine';
import { parse } from '@scaffdog/engine';
import { expect, test } from 'vitest';
import { extract } from './extract';

const options: Partial<ParseOptions> = {};

test('basic', () => {
  expect(
    extract(
      `
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
`,
      options,
    ),
  ).toEqual({
    variables: new Map([
      ['key', parse('value0', options)],
      ['key1', parse('value1', options)],
      ['key2', parse('{{ value2 }}', options)],
      ['key3', parse('Hello {{ value3 }} !', options)],
      ['$key', parse('value4', options)],
      ['_key', parse('value5', options)],
    ]),
    templates: [
      {
        filename: parse('basic.txt', options),
        content: parse('// line 1', options),
      },
      {
        filename: parse('{{ using.variable }}.txt', options),
        content: parse(
          `// line 1
// line 2
// line 3`,
          options,
        ),
      },
    ],
  });
});

test('without variables', () => {
  expect(
    extract(
      `
# filename

\`\`\`typescript
// code block
\`\`\`
`,
      options,
    ),
  ).toEqual({
    variables: new Map(),
    templates: [
      {
        filename: parse('filename', options),
        content: parse(`// code block`, options),
      },
    ],
  });
});
