import type { Context } from '@scaffdog/types';
import { helpers } from './helpers.js';
import { defaults } from './syntax.js';

const mergeMap = <T>(map1: Map<string, T>, map2: Map<string, T>) =>
  new Map([...map1, ...map2]);

export const extendContext = (
  context: Context,
  partial: Partial<Context>,
): Context => {
  const ctx = { ...context };

  ctx.cwd = partial.cwd ?? ctx.cwd;
  ctx.tags = partial.tags ?? ctx.tags;

  if (partial.helpers != null) {
    ctx.helpers = mergeMap(ctx.helpers, partial.helpers);
  }

  if (partial.variables != null) {
    ctx.variables = mergeMap(ctx.variables, partial.variables);
  }

  return ctx;
};

export const createContext = (partial: Partial<Context>): Context =>
  extendContext(
    {
      cwd: process.cwd(),
      helpers,
      variables: new Map(),
      tags: defaults.tags,
    },
    partial,
  );
