import { isPlainObject } from 'is-plain-object';

export const isNonNullish = (v: unknown): v is Record<string, unknown> => {
  return v != null;
};

export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';

export const isString = (v: unknown): v is string => typeof v === 'string';

export const isNumber = (v: unknown): v is number => typeof v === 'number';

export const isObject = (v: unknown): v is Record<string, unknown> =>
  isPlainObject(v);

export const isArray = (v: unknown): v is any[] => Array.isArray(v);

export const isFunction = (v: unknown): v is (...args: any[]) => any =>
  typeof v === 'function';

export type TypeOfName =
  | 'null'
  | 'undefined'
  | 'boolean'
  | 'number'
  | 'string'
  | 'function'
  | 'object'
  | 'array';

export const typeOf = (v: unknown): TypeOfName => {
  if (v === null) {
    return 'null';
  } else if (v === undefined) {
    return 'undefined';
  }

  if (isObject(v)) {
    return 'object';
  }

  switch (typeof v) {
    case 'number':
    case 'bigint':
      return 'number';
    case 'string':
      return 'string';
    case 'boolean':
      return 'boolean';
  }

  return 'object';
};
