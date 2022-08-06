import type { Helper, HelperMap } from '@scaffdog/types';
import { isArray, isNonNullish } from './utils';

export type CreateHelperOptions = {
  disableAutoLoop: boolean;
};

export const createHelper = <T extends any[]>(
  fn: Helper<T>,
  options: Partial<CreateHelperOptions> = {},
): Helper<T> => {
  const opts: CreateHelperOptions = {
    disableAutoLoop: options?.disableAutoLoop === true,
  };

  if (opts.disableAutoLoop) {
    return fn;
  }

  return (ctx, ...args) => {
    const f = fn.bind(null, ctx);

    if (isNonNullish(args[0]) && isArray(args[0])) {
      const rest = args.slice(1);
      return args[0].map((v) => (f as any)(v, ...rest));
    } else {
      return f(...args);
    }
  };
};

export const defineHelper = <T extends any[]>(
  helpers: HelperMap,
  name: string,
  fn: Helper<T>,
  options: Partial<CreateHelperOptions> = {},
): void => {
  helpers.set(name, createHelper<any>(fn, options));
};
