---
name: 'command'
root: 'src/cmds'
output: '.'
questions:
  name:
    message: 'Please enter command name.'
  desc:
    message: 'Please enter command description.'
    initial: 'TODO'
---

# Variables

- name: `{{ inputs.name | kebab }}`
- cmd: `{{ inputs.name | camel }}Cmd`

# `../bin.ts`

```typescript
{{- read output.abs | define "file" -}}
{{ file | before "^$" }}
import {{ cmd }} from './cmds/{{ name }}';
{{ file | after "^$" -1 | before "container\.set" }}
  container.set({{ cmd }}.name, {{ cmd }});
{{ file | after "container\.set" }}
```

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
