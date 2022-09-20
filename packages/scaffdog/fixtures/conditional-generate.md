---
name: 'conditional-generate'
root: 'tmp'
output: '.'
questions:
  bool:
    confirm: 'message'
---

# `{{ inputs.bool || "!" }}true.txt`

```
If bool is true, output.
```

# `{{ inputs.bool && "!" }}false.txt`

```
If bool is false, output.
```
