import type { Context } from './context';
import type { Variable } from './variable';

export type Helper = (
  context: Context,
  ...args: any[]
) => string | Helper | Variable;

export type HelperMap = Map<string, Helper>;

export type HelperRecord = Record<string, Helper>;

export type HelperRegister = (registry: HelperMap) => void;
