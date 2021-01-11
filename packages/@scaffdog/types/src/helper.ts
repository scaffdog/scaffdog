import type { Context } from './context';

export type Helper = (context: Context, ...args: any[]) => string;

export type HelperMap = Map<string, Helper>;

export type HelperRecord = Record<string, Helper>;

export type HelperRegister = (registry: HelperMap) => void;
