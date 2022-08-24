---
name: 'vars'
root: '.'
output: '.'
questions:
  foo: 'message'
---

# Variables

- foo: `{{ inputs.foo }}`

# `tmp/index.txt`

```
foo: {{ foo }}
```
