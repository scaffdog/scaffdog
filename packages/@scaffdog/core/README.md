# @scaffdog/core

`@scaffdog/core` is a low layer of scaffdog.

## Install

Install via npm:

```bash
$ npm install @scaffdog/core
```

## Usage

**template.md:**

````markdown
# Variables

- key: `{{ input | upper }}`

# `{{ input }}.txt`

```
{{ output.path }}
```
````

**index.ts:**

```typescript
import fs from 'fs';
import path from 'path';
import { createContext, compile } from '@scaffdog/engine';
import { extract, generate } from '@scaffdog/core';

const source = fs.readFileSync('template.md', 'utf8');
const context = createContext({});

const { variables, templates } = extract(source, context);

for (const [key, ast] of variables) {
  context.variables.set(key, compile(ast, context));
}

for (const template of templates) {
  const filename = compile(template.filename, context);

  const data = compile(
    template.content,
    extendContext({
      variables: new Map([
        [
          'output',
          {
            path: filename,
          },
        ],
      ]),
    }),
  );

  fs.writeFileSync(filename, data);
}

// --> Generated "path/to/scaffdog.txt"
```
