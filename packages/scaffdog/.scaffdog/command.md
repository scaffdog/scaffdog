---
name: 'command'
root: 'src/commands'
output: '.'
questions:
  name:
    message: 'Please enter command name.'
  summary:
    message: 'Please enter command summary.'
    initial: 'TODO'
---

# Variables

- name: `{{ inputs.name | kebab }}`
- cmd: `{{ inputs.name | camel }}`

# `../commands/index.ts`

```typescript
{{- blank := "^$" -}}
{{- file := read output.abs -}}
{{- header := file | before blank -}}
{{- body := file | after blank -}}

{{ header }}
import {{ cmd }} from './{{ name }}.js';

{{ body | replace "];" ("," + cmd + "];") }}
```

# `{{ name }}.ts`

```typescript
import { createCommand } from '{{ relative "../src/command" }}.js';

export default createCommand({
  name: '{{ name }}',
  summary: '{{ inputs.summary }}',
  args: {},
  flags: {},
})(async ({ cwd, logger, args, flags }) => {
  logger.debug(cwd, args, flags);
  throw new Error('unimplemented'); // TODO
});
```

# `{{ name }}.test.ts`

```typescript
import { expect, test } from 'vitest';
import { createCommandRunner } from '{{ relative "../src/mocks/command-test-utils" }}.js';
import cmd from './{{ name }}.js';

const run = createCommandRunner(cmd, {
  args: {},
  flags: {},
});

test('TODO', async () => {
  const { code } = await run({});

  expect(code).toBe(0);
});
```
