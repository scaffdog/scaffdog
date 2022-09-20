---
name: 'basic'
root: 'tmp'
output: '.'
---

# `static.txt`

```
static content
```

# `nest/output.txt`

```
{{-/* comment */-}}
{{ document.name }}
{{ output.name }}
{{ output.base }}
{{ output.path }}
{{ output.ext }}
{{ output.dir }}
```
