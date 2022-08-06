---
name: 'question'
root: 'tmp'
output: '.'
questions:
  shorthand: 'shorthand'
  input:
    message: 'input'
  input_with_initial:
    message: 'input'
    initial: 'input (initial)'
  bool:
    confirm: 'bool'
  bool_with_true:
    confirm: 'bool'
    initial: true
  bool_with_false:
    confirm: 'bool'
    initial: false
  list:
    message: 'list'
    choices: ['A', 'B', 'C']
  list_with_initial:
    message: 'list'
    choices: ['A', 'B', 'C']
    initial: ['A', 'C']
  checkbox:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
  checkbox_with_initial:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
    initial: ['B', 'C']
---

# `result.txt`

```
shorthand: {{ inputs.shorthand }}
input: {{ inputs.input }}
input_with_initial: {{ inputs.input_with_initial }}
bool: {{ inputs.bool }}
bool_with_true: {{ inputs.bool_with_true }}
bool_with_false: {{ inputs.bool_with_false }}
list: {{ inputs.list }}
list_with_initial: {{ inputs.list_with_initial }}
checkbox: {{ inputs.checkbox }}
checkbox_with_initial: {{ inputs.checkbox_with_initial }}
```
