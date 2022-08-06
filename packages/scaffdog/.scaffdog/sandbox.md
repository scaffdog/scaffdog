---
name: 'sandbox'
root: '.'
output: ['.', 'src/**/*']
questions:
  bool:
    confirm: 'Yes of No'
  array:
    message: 'Please select elements'
    multiple: true
    choices:
      - 'A'
      - 'B'
      - 'C'
    initial: ['B', 'C']
---

# Variables

- name: `{{ "foo_bar" | kebab }}`

# `{{ name }}.ts`

```typescript
import { createCommand } from '{{ relative "../src/command" }}';

{{ if inputs.bool -}}
console.log('boolean: true');
{{- else -}}
console.log('boolean: false');
{{- end }}
{{ for v, i in inputs.array }}
console.log('array: {{ i }} - {{ v }}');{{ end }}

export default createCommand({
  name: '{{ name }}',
  key: '{{ name }}',
  description: '{{ "TODO" }}',
  build: (yargs) => yargs,
})(async ({ cwd, logger, options }) => {
  logger.debug(cwd, options);
  throw new Error('unimplemented'); // TODO
});
```
