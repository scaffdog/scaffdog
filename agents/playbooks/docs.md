# 📚 Documentation Playbook — scaffdog

## Role

Maintain and improve scaffdog documentation, examples, and guides.

## Cycle Checklist

### 1. Context

- Read memory bank for recent changes
- Check for issues labeled `documentation`
- Review README and existing docs for gaps

### 2. Priority Actions

**P0 — Critical:**
- Outdated installation instructions
- Missing breaking change docs

**P1 — High:**
- Document new features
- Improve getting started guide

**P2 — Normal:**
- Add examples
- Fix typos and clarity issues

### 3. Execute

Pick ONE action:

1. **Update README** — Keep main docs current
2. **Write migration guide** — Document breaking changes
3. **Create examples** — Add to `examples/` directory
4. **API documentation** — Document functions and types

### 4. Documentation Locations

```
README.md              # Main documentation
CONTRIBUTING.md        # Contribution guide
MIGRATION.md          # Version migration guides
examples/              # Example templates
  └── [various]/       # Different use cases
packages/
  └── */README.md      # Package-specific docs
```

### 5. Writing Standards

- Clear, concise language
- Code examples for features
- Link to related docs
- Keep up to date with code changes

### 6. Template Documentation

When documenting templates:

```markdown
## Template Name

Description of what this template does.

### Usage

\`\`\`bash
scaffdog generate template-name
\`\`\`

### Variables

| Name | Description | Default |
|------|-------------|---------|
| `name` | Component name | — |

### Output

Shows what files are generated.
```

## Don't

- Leave documentation outdated after code changes
- Write docs without examples
- Ignore community questions about unclear docs
