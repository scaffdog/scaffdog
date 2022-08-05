---
name: 'a'
root: '.'
output: '.'
---

# `tmp/nest/dump.txt`

```
{{-/* comment */-}}
{{ document.name }}
{{ output.path }}
{{ output.name }}
{{ output.base }}
{{ output.ext }}
{{ output.dir }}
{{ read "./partial/dump.txt" }}
{{ relative "../snapshots/src/" }}
```

# `tmp/generate.txt`

```
foo
```
