---
name: 'component-ui'
root: 'components'
output: '**/*'
ignore:
  - '**/icons'
questions:
  name: 'Please enter a component name.'
---

# Variables

- name: `{{ inputs.name | pascal }}`

# `{{ name }}.tsx`

```typescript
export type Props = {
  children: React.ReactNode;
};

export const {{ name }}: React.FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};
```
