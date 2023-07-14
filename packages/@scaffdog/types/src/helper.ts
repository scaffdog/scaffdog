import type { Context } from './context.js';
import type { Variable } from './variable.js';

export type Helper<T extends any[] = any[]> = (
  context: Context,
  ...args: T
) => string | Helper | Variable;

export type HelperMap = Map<string, Helper>;

export type HelperRecord = Record<string, Helper>;

export type HelperRegister = (registry: HelperMap) => void;
