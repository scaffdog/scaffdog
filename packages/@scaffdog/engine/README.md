# @scaffdog/engine

A module of scaffdog template engine.

## Install

Install via npm:

```bash
$ npm install @scaffdog/engine
```

## Usage

The following code is a basic example:

```typescript
import { compile, createContext } from '@scaffdog/engine';

const context = createContext({
  variables: new Map([['name', 'scaffdog']]),
  helpers: new Map([['greet', (_, name: string) => `Hi ${name}!`]]),
});

const output = compile(`OUTPUT: {{ name | greet }}`, context);
// --> "OUTPUT: Hi scaffdog!"
```

### Custom Tags

You can change the tag delimiter with `context.tags`:

```typescript
import { compile, createContext } from '@scaffdog/engine';

const context = createContext({
  tags: ['<%=', '=%>'],
});

compile(`<%= "custom tag" =%>`, context);
```
