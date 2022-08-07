# Contributing

We are always welcoming your contribution :clap:

---

<p align="center">
   <strong><a href="#setup">Setup</a></strong>
   |
   <strong><a href="#running-lintingtests">Running linting/tests</a></strong>
</p>

---

## Developing

### Setup

Fork the `scaffdog` repository to your GitHub Account.

Then, run:

```bash
$ git clone https://github.com/<your-github-username>/scaffdog
$ cd scaffdog
$ pnpm i
```

Then you can run:

```bash
$ pnpm build
```

### Running linting/tests

You can run lint via:

```bash
$ pnpm lint
```

You can run eslint's autofix + prettier via:

```bash
$ pnpm format
```

You can run tests via:

```bash
$ pnpm test
```

You can run typecheck via:

```bash
$ pnpm typecheck
```
