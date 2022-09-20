---
name: 'inputs'
root: 'tmp'
output: '**/*'
questions:
  value: 'Please enter a keyword.'
  choice:
    message: 'choice'
    choices:
      - A
      - B
      - C
---

# `{{ inputs.value }}.txt`

```
value: {{ inputs.value }}
choice: {{ inputs.choice }}
path: {{ output.path }}
```
