import type { Context } from '@scaffdog/types';
import { helpers } from './helpers';

const mergeMap = <T>(map1: Map<string, T>, map2: Map<string, T>) =>
  new Map([...map1, ...map2]);

export const createContext = (partial: Partial<Context>): Context => {
  const ctx = {
    cwd: process.cwd(),
    helpers,
    variables: new Map(),
    ...partial,
  };

  if (partial.helpers != null) {
    ctx.helpers = mergeMap(helpers, partial.helpers);
  }

  return ctx;
};

export const extendContext = (
  context: Context,
  partial: Partial<Context>,
): Context => {
  const ctx = {
    ...context,
  };

  if (partial.helpers != null) {
    ctx.helpers = mergeMap(context.helpers, partial.helpers);
  }

  if (partial.variables != null) {
    ctx.variables = mergeMap(context.variables, partial.variables);
  }

  return ctx;
};
