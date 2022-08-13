---
name: 'component-icon'
root: 'components/icons'
output: '**/*'
questions:
  name: 'Please enter a icon component name.'
---

# Variables

- name: `{{ inputs.name | pascal }}Icon`

# `{{ name }}.tsx`

```typescript
export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const {{ name }}: React.FC<Props> = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <path />
  </svg>
);
```
