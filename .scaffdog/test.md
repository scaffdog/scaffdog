---
name: 'test'
description: 'test of description'
message: 'Please enter any text.'
root: 'tmp'
output: '**/*'
ignore: []
---

# `test.md`

```markdown
- input: {{ input }}
- basename: {{ basename }}
- filename: {{ filename }}
- extname: {{ extname }}
- root: {{ root }}
- output: {{ output }}

Actual: {{ input | eval '("--> " + input).toUpperCase()' }}
Expect: --> {{ input | upper }}

Actual: {{ input | replace '.ts$' '.js' }} ({{ input }})
Expect: foo.js
```
