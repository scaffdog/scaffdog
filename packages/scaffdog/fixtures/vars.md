---
name: 'vars'
root: '.'
output: '.'
questions:
  foo: 'message'
---

# Variables

- foo: `{{ inputs.foo | pascal }}`

# `index.txt`

```
raw: {{ inputs.foo }}
foo: {{ foo }}
```
