---
name: 'b'
root: 'tmp/root'
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

# `b.txt`

```
value: {{ inputs.value }}
choice: {{ inputs.choice }}
path: {{ output.path }}
```
