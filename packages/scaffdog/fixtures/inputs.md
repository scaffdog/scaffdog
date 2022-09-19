---
name: 'inputs'
root: 'output'
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
