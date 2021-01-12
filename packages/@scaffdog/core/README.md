# @scaffdog/core

`@scaffdog/core` is a low layer of scaffdog.

## Install

Install via npm:

```bash
$ npm install @scaffdog/core
```

## Usage

```typescript
import fs from 'fs';
import { extract, generate } from '@scaffdog/core';

const { variables, templates } = extract(
  `
# Variables

- key: \`{{ input | upper }}\`

# \`{{ input }}.txt\`

\`\`\`
{{ output.path }}
\`\`\`
`.trim(),
);

variables.set('input', 'scaffdog');

const files = generate(templates, variables, {
  root: 'path/to',
  helpers: new Map(),
});

files.forEach((file) => {
  fs.writeFileSync(file.output, file.content);
});

// --> Generated "path/to/scaffdog.txt"
```
