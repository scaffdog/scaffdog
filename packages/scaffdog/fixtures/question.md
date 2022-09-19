---
name: 'question'
root: '.'
output: '.'
questions:
  shorthand: 'shorthand'
  input:
    message: 'input'
  input_with_initial:
    message: 'input'
    initial: 'input (initial)'
  input_if:
    message: 'input'
    if: true
  input_if_with_initial:
    message: 'input'
    if: false
    initial: 'default'
  input_if_without_initial:
    message: 'input'
    if: false
  bool:
    confirm: 'bool'
  bool_with_true:
    confirm: 'bool'
    initial: true
  bool_with_false:
    confirm: 'bool'
    initial: false
  bool_if:
    confirm: 'bool'
    if: true
  bool_if_with_initial:
    confirm: 'bool'
    if: false
    initial: true
  bool_if_without_initial:
    confirm: 'bool'
    if: false
  list:
    message: 'list'
    choices: ['A', 'B', 'C']
  list_with_initial:
    message: 'list'
    choices: ['A', 'B', 'C']
    initial: 'B'
  list_if:
    message: 'list'
    choices: ['A', 'B', 'C']
    if: true
  list_if_with_initial:
    message: 'list'
    choices: ['A', 'B', 'C']
    if: false
    initial: 'B'
  list_if_without_initial:
    message: 'list'
    choices: ['A', 'B', 'C']
    if: false
  checkbox:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
  checkbox_with_initial:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
    initial: ['B', 'C']
  checkbox_if:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
    if: true
  checkbox_if_with_initial:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
    if: false
    initial: ['B', 'C']
  checkbox_if_without_initial:
    message: 'checkbox'
    multiple: true
    choices: ['A', 'B', 'C']
    if: false
---

# `result.txt`

```
shorthand: {{ inputs.shorthand }}
input: {{ inputs.input }}
input_with_initial: {{ inputs.input_with_initial }}
input_if: {{ inputs.input_if }}
input_if_with_initial: {{ inputs.input_if_with_initial }}
input_if_without_initial: {{ inputs.input_if_without_initial }}
bool: {{ inputs.bool ? "true" : "false" }}
bool_with_true: {{ inputs.bool_with_true ? "true" : "false"}}
bool_with_false: {{ inputs.bool_with_false ? "true" : "false"}}
bool_if: {{ inputs.bool_if ? "true" : "false" }}
bool_if_with_initial: {{ inputs.bool_if_with_initial ? "true" : "false" }}
bool_if_without_initial: {{ inputs.bool_if_without_initial ? "true" : "false" }}
list: {{ inputs.list }}
list_with_initial: {{ inputs.list_with_initial }}
list_if: {{ inputs.list_if }}
list_if_with_initial: {{ inputs.list_if_with_initial }}
list_if_without_initial: {{ inputs.list_if_without_initial }}
checkbox: {{ inputs.checkbox }}
checkbox_with_initial: {{ inputs.checkbox_with_initial }}
checkbox_if_with_initial: {{ inputs.checkbox_if_with_initial }}
checkbox_if_without_initial: {{ inputs.checkbox_if_without_initial }}
```
