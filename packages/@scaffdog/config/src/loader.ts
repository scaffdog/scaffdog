import fs from 'fs';
import path from 'path';
import createJITI from 'jiti';
import type { Config, ResolvedConfig } from '@scaffdog/types';
import { validateConfig } from './validator';

const jiti = createJITI(__filename, {
  cache: false,
  interopDefault: true,
  requireCache: false,
  esmResolve: true,
});

const extensions = ['js', 'cjs', 'mjs', 'ts'];

const obj2map = <T>(obj: Record<string, T>) => {
  return new Map(Object.entries(obj));
};

const fstat = (filepath: string) => {
  try {
    return fs.statSync(filepath);
  } catch (e) {
    return null;
  }
};

const fileExists = (filepath: string): boolean =>
  fstat(filepath)?.isFile() ?? false;

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

export type LoadConfigResult = {
  filepath: string;
  config: ResolvedConfig;
};

export const loadConfig = (
  cwd: string = process.cwd(),
  options: Partial<LoadConfigOptions> = {},
): LoadConfigResult => {
  const opts = {
    project: '.scaffdog',
    ...options,
  };

  let filepath = '';
  let maybeConfig: unknown;
  for (const ext of extensions) {
    filepath = path.resolve(cwd, opts.project, `config.${ext}`);
    if (!fileExists(filepath)) {
      continue;
    }

    maybeConfig = jiti(filepath);
    if (maybeConfig != null) {
      break;
    }
  }

  if (maybeConfig == null) {
    const expected = `config.{${extensions.join(',')}}`;
    throw new Error(
      `scaffdog configuration file not found (filename expected: "${expected}" in "${opts.project}")`,
    );
  }

  const config = validateConfig(maybeConfig);

  return {
    filepath,
    config: {
      ...config,
      variables: obj2map(config.variables ?? {}),
      helpers: normalizeHelpers(config.helpers),
    },
  };
};
