# 📜 Master Rules — scaffdog

> Living rulebook for the scaffdog autonomous agent team.
> All roles MUST follow these rules.

---

## R-001: Memory Bank Protocol

**Every dispatch cycle MUST:**

1. **Read** `agents/memory/bank.md` before taking action
2. **Update** the relevant section after acting
3. **Never delete** another role's state
4. **Timestamp** the `Last updated` field

---

## R-002: Commit Standards

Follow scaffdog's existing conventions:

- Conventional commits: `<type>(<scope>): <description>`
- Types: feat, fix, docs, test, chore, refactor
- Imperative mood ("add" not "added")
- Reference issues when applicable

---

## R-003: Branch Strategy

- `canary` — Development branch (primary target)
- `main` — Stable releases
- Features: `feat/<name>`
- Fixes: `fix/<name>`

**All PRs target `canary`.**

---

## R-004: Quality Standards

- All code must pass `pnpm lint`
- All code must pass `pnpm typecheck`
- All code must pass `pnpm test`
- Format with `pnpm format` before committing

---

## R-005: PR Management

- PRs should not sit open > 2 cycles
- Squash merge preferred
- Link related issues

---

_Rules can be added by committing changes to this file._
