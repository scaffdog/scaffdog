import type { HelperMap, Variable } from '@scaffdog/types';
import * as cc from 'change-case';
import plur from 'plur';
import dayjs from 'dayjs';
import { defineHelper } from './helper-utils.js';
import { isArray, isString, isNumber, isObject, typeOf } from './utils.js';

export const helpers: HelperMap = new Map();

/**
 * internal
 */
const splitLines = (v: string) => v.split(/\r?\n/);

/**
 * array utils
 */
defineHelper<[v: string, sep: string]>(helpers, 'split', (_, v, sep) =>
  v.split(sep),
);

defineHelper<[v: string[], sep: string]>(
  helpers,
  'join',
  (_, v, sep) => v.join(sep),
  {
    disableAutoLoop: true,
  },
);

defineHelper<[first: number, increment?: number, last?: number]>(
  helpers,
  'seq',
  (_, first, increment, last) => {
    const iter = {
      start: first,
      step: 1,
      end: 0,
    };

    if (isNumber(increment) && isNumber(last)) {
      iter.step = increment;
      iter.end = last;
    } else if (isNumber(increment)) {
      iter.end = increment;
    } else {
      iter.start = 1;
      iter.end = first;
    }

    const arr: number[] = [];
    let n = iter.start;
    while (n <= iter.end) {
      arr.push(n);
      n += iter.step;
    }

    return arr;
  },
  {
    disableAutoLoop: true,
  },
);

defineHelper<[v: Variable[], ...args: Variable[]]>(
  helpers,
  'append',
  (_, v, ...args) => [...v, ...args],
  {
    disableAutoLoop: true,
  },
);

defineHelper<[v: Variable[]]>(
  helpers,
  'uniq',
  (_, v) => Array.from(new Set(v)),
  {
    disableAutoLoop: true,
  },
);

/**
 * language
 */
defineHelper<[v: string]>(helpers, 's2n', (_, v) => {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
});

defineHelper<[v: number]>(helpers, 'n2s', (_, v) => String(v));

defineHelper<[v: any]>(
  helpers,
  'len',
  (_, v) => {
    if (isString(v) || isArray(v)) {
      return v.length;
    }
    if (isNumber(v)) {
      return v.toString().length;
    }
    if (isObject(v)) {
      return Object.keys(v).length;
    }
    return 0;
  },
  {
    disableAutoLoop: true,
  },
);

defineHelper<[v: string | any[], start: number, end?: number]>(
  helpers,
  'slice',
  (_, v, start, end) => {
    if (isString(v) || isArray(v)) {
      return v.slice(start, end);
    }
    throw new Error(
      `slice helper expecting string or array value but got "${typeOf(v)}"`,
    );
  },
  {
    disableAutoLoop: true,
  },
);

defineHelper<[search: string | any[], item: any]>(
  helpers,
  'contains',
  (_, search, item) => {
    if (isString(search) || isArray(search)) {
      return search.includes(item);
    }
    throw new Error(
      `contains helper expecting string or array value but got "${typeOf(
        search,
      )}"`,
    );
  },
  {
    disableAutoLoop: true,
  },
);

/**
 * string utils
 */
defineHelper<[v: string]>(helpers, 'camel', (_, v) => cc.camelCase(v));
defineHelper<[v: string]>(helpers, 'snake', (_, v) => cc.snakeCase(v));
defineHelper<[v: string]>(helpers, 'pascal', (_, v) => cc.pascalCase(v));
defineHelper<[v: string]>(helpers, 'kebab', (_, v) => cc.kebabCase(v));
defineHelper<[v: string]>(helpers, 'constant', (_, v) => cc.constantCase(v));
defineHelper<[v: string]>(helpers, 'upper', (_, v) => v.toUpperCase());
defineHelper<[v: string]>(helpers, 'lower', (_, v) => v.toLowerCase());

defineHelper<[v: string, count: number]>(helpers, 'plur', (_, v, count = 2) =>
  plur(v, count),
);

defineHelper<[v: string, pattern: string, replacement: string]>(
  helpers,
  'replace',
  (_, v, pattern, replacement) =>
    v.replace(new RegExp(pattern, 'g'), replacement),
);

defineHelper<[v: string]>(helpers, 'trim', (_, v) => v.trim());
defineHelper<[v: string]>(helpers, 'ltrim', (_, v) => v.trimStart());
defineHelper<[v: string]>(helpers, 'rtrim', (_, v) => v.trimEnd());

defineHelper<[v: string, n: string | number, offset?: number]>(
  helpers,
  'before',
  (_, v, n, offset) => {
    const lines = splitLines(v);
    const off = offset ?? 0;

    if (typeof n === 'string') {
      const regexp = new RegExp(n);
      for (let i = 0; i < lines.length; i++) {
        if (regexp.test(lines[i])) {
          return lines.slice(0, i + off).join('\n');
        }
      }
      return v;
    }

    return lines.slice(0, n - 1 + off).join('\n');
  },
);

defineHelper<[v: string, n: string | number, offset?: number]>(
  helpers,
  'after',
  (_, v, n, offset) => {
    const lines = splitLines(v);
    const off = offset ?? 0;

    if (typeof n === 'string') {
      const regexp = new RegExp(n);
      for (let i = 0; i < lines.length; i++) {
        if (regexp.test(lines[i])) {
          return lines.slice(i + 1 + off).join('\n');
        }
      }
      return v;
    }

    return lines.slice(n + off).join('\n');
  },
);

/**
 * date
 */
defineHelper<[format?: string]>(helpers, 'date', (_, format) => {
  const d = dayjs();
  return format ? d.format(format) : d.toISOString();
});

/**
 * template helpers
 */
defineHelper(helpers, 'noop', () => '');

defineHelper<[v: string, key: string]>(helpers, 'define', (ctx, v, key) => {
  ctx.variables.set(key, v);
  return '';
});
