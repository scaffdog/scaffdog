import type { HelperMap } from '@scaffdog/types';
import * as cc from 'change-case';
import dayjs from 'dayjs';
import safeEval from 'safe-eval';
import { defineHelper } from './helper-utils';

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

/**
 * language
 */
defineHelper<[v: string]>(helpers, 's2n', (_, v) => {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
});

defineHelper<[v: number]>(helpers, 'n2s', (_, v) => String(v));

defineHelper<[v: string, code?: string]>(helpers, 'eval', (ctx, v, code) => {
  const evalCode = code != null ? code : v;
  const context: { [key: string]: any } = Object.create(null);

  for (const [key, value] of ctx.variables.entries()) {
    context[key] = value;
  }

  return safeEval(evalCode, context);
});

/**
 * string utils
 */
defineHelper<[v: string]>(helpers, 'camel', (_, v) => cc.camelCase(v));
defineHelper<[v: string]>(helpers, 'snake', (_, v) => cc.snakeCase(v));
defineHelper<[v: string]>(helpers, 'pascal', (_, v) => cc.pascalCase(v));
defineHelper<[v: string]>(helpers, 'kebab', (_, v) => cc.paramCase(v));
defineHelper<[v: string]>(helpers, 'constant', (_, v) => cc.constantCase(v));
defineHelper<[v: string]>(helpers, 'upper', (_, v) => v.toUpperCase());
defineHelper<[v: string]>(helpers, 'lower', (_, v) => v.toLowerCase());

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
