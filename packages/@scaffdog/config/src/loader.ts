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

export const loadConfig = (
  cwd: string = process.cwd(),
  options: Partial<LoadConfigOptions> = {},
): ResolvedConfig => {
  const opts = {
    project: '.scaffdog',
    ...options,
  };

  let maybeConfig: unknown;
  for (const ext of extensions) {
    const filename = `config.${ext}`;
    const filepath = path.resolve(cwd, opts.project, filename);
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
      `scaffdog configuration file not found (filename expected: "${expected}")`,
    );
  }

  const config = validateConfig(maybeConfig);

  return {
    ...config,
    variables: obj2map(config.variables ?? {}),
    helpers: normalizeHelpers(config.helpers),
  };
};
