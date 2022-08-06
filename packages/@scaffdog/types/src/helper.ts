import type { Context } from './context';
import type { Variable } from './variable';

export type Helper<T extends any[] = any[]> = (
  context: Context,
  ...args: T
) => string | Helper | Variable;

export type HelperMap = Map<string, Helper>;

export type HelperRecord = Record<string, Helper>;

export type HelperRegister = (registry: HelperMap) => void;
