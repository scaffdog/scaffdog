# @scaffdog/engine

A module of scaffdog template engine.

## Install

Install via npm:

```bash
$ npm install @scaffdog/engine
```

## Usage

```typescript
import { compile, createContext } from '@scaffdog/engine';

const context = createContext({
  variables: new Map([['name', 'scaffdog']]),
  helpers: new Map([['greet', (_, name: string) => `Hi ${name}!`]]),
});

const output = compile(`OUTPUT: {{ name | greet }}`, context);
// --> "OUTPUT: Hi scaffdog!"
```
