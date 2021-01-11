import path from 'path';
import type { Config, ResolvedConfig } from '@scaffdog/types';
import { validateConfig } from './validator';

const obj2map = <T>(obj: Record<string, T>) => {
  return new Map(Object.entries(obj));
};

const normalizeHelpers = (
  helpers: Config['helpers'],
): ResolvedConfig['helpers'] => {
  let map = new Map();

  (helpers ?? []).forEach((value) => {
    if (typeof value === 'function') {
      value(map);
    } else {
      map = new Map([...map, ...obj2map(value)]);
    }
  });

  return map;
};

export type LoadConfigOptions = {
  project: string;
};

export const loadConfig = (
  cwd: string = process.cwd(),
  options: Partial<LoadConfigOptions> = {},
): ResolvedConfig => {
  const opts = {
    project: '.scaffdog',
    ...options,
  };

  const maybeConfig = require(path.resolve(cwd, opts.project, 'config.js'));
  const config = validateConfig(maybeConfig);

  return {
    ...config,
    variables: obj2map(config.variables ?? {}),
    helpers: normalizeHelpers(config.helpers),
  };
};
