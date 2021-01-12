# @scaffdog/error

A utility module of scaffdog error.

## Install

Install via npm:

```bash
$ npm install @scaffdog/error
```

## Usage

```typescript
import { error } from '@scaffdog/error';

const e = error('unexpected token', {
  source: 'text {{ ] }}',
  loc: {
    start: { line: 1, column: 9 },
    end: { line: 1, column: 9 },
  },
});

console.log(e.message);

//   unexpected token:
//
// > │ text {{ ] }}
//   │         ^
```
