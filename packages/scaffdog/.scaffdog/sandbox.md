---
name: 'sandbox'
root: '.'
output: ['.', 'src/**/*']
---

# Variables

- name: `{{ inputs.name | kebab }}`

# `{{ name }}.ts`

```typescript
import { createCommand } from '{{ relative "../src/command" }}';

export default createCommand({
  name: '{{ name }}',
  key: '{{ name }}',
  description: '{{ inputs.desc }}',
  build: (yargs) => yargs,
})(async ({ cwd, logger, options }) => {
  logger.debug(cwd, options);
  throw new Error('unimplemented'); // TODO
});
```
