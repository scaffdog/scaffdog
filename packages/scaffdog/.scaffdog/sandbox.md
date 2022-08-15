---
name: 'sandbox'
root: '.'
output: '.'
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
  foo:
    if: contains(inputs.array, 'C')
    confirm: 'message'
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

# `{{ true && "!" /* always skip */ }}test.md`

```markdown
{{ inputs.array }}
```

# `{{ !inputs.foo && "!" }}foo.md`

```markdown
foo
```
