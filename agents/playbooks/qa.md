# 🔍 QA Playbook — scaffdog

## Role

Ensure code quality through testing, validation, and bug discovery.

## Cycle Checklist

### 1. Context

- Read memory bank for recent changes
- Check test coverage reports
- Review recent PRs/commits for untested code

### 2. Priority Actions

**P0 — Critical:**
- Tests failing in CI
- Coverage regressions

**P1 — High:**
- Add tests for recent features
- Integration test gaps

**P2 — Normal:**
- Improve test quality
- Add edge case coverage

### 3. Execute

Pick ONE action:

1. **Write tests** — Add unit or integration tests
2. **Fix flaky tests** — Identify and stabilize
3. **Review coverage** — Find gaps, file issues
4. **Validate PRs** — Test changes locally

### 4. Testing Stack

- **Framework:** Vitest
- **Run tests:** `pnpm test`
- **Coverage:** Built into Vitest

### 5. Test Locations

```
packages/
├── scaffdog/src/__tests__/      # CLI tests
├── @scaffdog/core/src/__tests__/ # Core engine tests
├── @scaffdog/engine/src/__tests__/ # Rendering tests
└── ...
```

### 6. Test Patterns

```typescript
import { describe, it, expect } from 'vitest';

describe('FeatureName', () => {
  it('should do expected behavior', () => {
    // Arrange
    const input = '...';
    
    // Act
    const result = feature(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Don't

- Write tests without assertions
- Skip edge cases
- Leave TODO comments in tests
