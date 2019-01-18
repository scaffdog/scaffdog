---
name: 'test'
description: 'test of description'
message: 'Please enter any text.'
root: 'tmp'
output: '**/*'
ignore: []
---

# `paths.md`

description. description.

```markdown
- input: {{ input }}
- basename: {{ basename }}
- filename: {{ filename }}
- extname: {{ extname }}
- root: {{ root }}
- output: {{ output }}
```

# `functions.md`

```markdown
{{ input | eval '("--> " + input).toUpperCase()' }}
{{ input | replace '.ts$' '.js' }} ({{ input }})
{{ relative "../src/template/compiler.ts" }}
```

# `{{ input | snake }}/nest/test.md`

```markdown
{{ relative "../src/template/compiler.ts" }}
```

# `{{ input | snake }}/nest/read.md`

```markdown
From body: {{ relative "../src/template/ast.ts" }}
From partials: {{ read "./partials/content.md" }}
```
