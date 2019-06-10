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

# `trim.md`

```markdown
- {{- input /* a comment */ -}} test

  {{- input -}}

test
```

# `functions.md`

```markdown
{{ input | eval '("--> " + input).toUpperCase()' }}
{{ output | replace '.md$' '.txt' }} ({{ output }})
{{ output | replace extname '.txt' }} ({{ output }})
{{ output | replace basename filename }} ({{ output }})
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
