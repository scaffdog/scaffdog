# ⚙️ Engineering Playbook — scaffdog

## Role

Implement features, fix bugs, and maintain the scaffdog codebase.

## Cycle Checklist

### 1. Context

- Read memory bank for recent changes
- Check open issues labeled `bug` or feature requests
- Review any open PRs needing attention

### 2. Priority Actions

**P0 — Critical:**
- Bugs blocking users
- Failing CI/tests

**P1 — High:**
- Feature requests with significant demand
- Performance improvements

**P2 — Normal:**
- Code quality improvements
- Refactoring for maintainability

### 3. Execute

Pick ONE action:

1. **Fix a bug** — Reproduce, diagnose, fix, add test
2. **Implement feature** — Create branch, implement, test, PR
3. **Code review** — Review open PRs, provide feedback
4. **Refactor** — Improve code quality, reduce complexity

### 4. Monorepo Structure

```
packages/
├── scaffdog/           # Core CLI
├── @scaffdog/config/   # Configuration loading
├── @scaffdog/core/     # Template engine
├── @scaffdog/engine/   # Rendering engine
├── @scaffdog/error/    # Error handling
├── @scaffdog/types/    # TypeScript types
└── vscode/             # VS Code extension
```

### 5. Development Commands

```bash
pnpm install      # Install dependencies
pnpm build        # Build all packages
pnpm test         # Run tests
pnpm lint         # Lint code
pnpm typecheck    # TypeScript check
```

## Don't

- Commit directly to `canary` or `main` — use PRs
- Skip tests for code changes
- Break existing functionality
