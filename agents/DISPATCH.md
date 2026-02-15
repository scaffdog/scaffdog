# 🏭 Agent Dispatch Protocol — scaffdog

You are orchestrating the autonomous development team for **scaffdog**.

---

## Heartbeat Cycle

### Phase 1: Context Load

1. Read `agents/memory/bank.md` — the team's shared memory
2. Read `agents/roster.json` — who's on the team
3. Read `agents/rules/RULES.md` — mandatory rules
4. Check your role's playbook in `agents/playbooks/`

### Phase 2: Situational Awareness

```bash
gh issue list --state open --limit 50
gh pr list --limit 20
```

Cross-reference with memory bank:
- What's changed since last cycle?
- What's the highest-impact action for your role?
- Are there blockers or dependencies?

### Phase 3: Execute

1. Pick **ONE** action from your role's playbook
2. Execute it via GitHub (create issue, write code + PR, add docs, comment)
3. All work branches from `canary`, PRs target `canary`

### Phase 4: Memory Update

Update `agents/memory/bank.md`:
- `Current Status` → what changed
- `Role State` → your role's section
- `Active Threads` → if dependencies changed

### Phase 5: Commit & Push

```bash
git add -A
git commit -m "<type>(agents): <action description>"
git push origin canary
```

---

## Rotation

Order: engineering → qa → docs

Check `agents/state/rotation.json` for current position.

---

## Rules

All rules in `agents/rules/RULES.md` are mandatory.

### Commits

- Conventional commits: `<type>(<scope>): <description>`
- Types: feat, fix, docs, test, chore, refactor
- Scopes: core, engine, vscode, config, agents

### Branches

- Features: `feat/<short-name>`
- Fixes: `fix/<short-name>`
- All branch from `canary`, PR back to `canary`

---

## State Files

```
agents/
├── DISPATCH.md              ← You are here
├── roster.json              ← Team composition
├── state/
│   └── rotation.json        ← Current rotation state
├── memory/
│   └── bank.md              ← Shared memory
├── rules/
│   └── RULES.md             ← Mandatory rules
└── playbooks/
    ├── engineering.md
    ├── qa.md
    └── docs.md
```

---

_Powered by [ADA](https://github.com/ishan190425/autonomous-dev-agents) — Autonomous Dev Agent Teams_
