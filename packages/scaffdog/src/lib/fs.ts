import { readFileSync, statSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import type { GlobbyOptions } from 'globby';
import globby from 'globby';

export type FsMkdirOptions = {
  recursive?: boolean;
};

export type FsGlobOptions = GlobbyOptions;

export type FsLibrary = {
  mkdir: (filepath: string, options: FsMkdirOptions) => Promise<void>;
  readFile: (filepath: string) => Promise<string>;
  readFileSync: (filepath: string) => string;
  glob: (
    patterns: string | readonly string[],
    options: FsGlobOptions,
  ) => Promise<string[]>;
  writeFile: (filepath: string, data: string) => Promise<void>;
  fileExists: (filepath: string) => boolean;
  directoryExists: (filepath: string) => boolean;
};

export const createFsLibrary = (): FsLibrary => {
  const fstat = (filepath: string) => {
    try {
      return statSync(filepath);
    } catch (e) {
      return null;
    }
  };

  return {
    mkdir: async (filepath, options) => {
      await mkdir(filepath, options);
    },

    readFile: async (filepath) => {
      return await readFile(filepath, 'utf8');
    },

    readFileSync: (filepath) => {
      return readFileSync(filepath, 'utf8');
    },

    glob: async (patterns, options) => {
      return await globby(patterns, options);
    },

    writeFile: async (filepath, data) => {
      return await writeFile(filepath, data, 'utf8');
    },

    fileExists: (filepath) => {
      return fstat(filepath)?.isFile() ?? false;
    },

    directoryExists: (filepath) => {
      return fstat(filepath)?.isDirectory() ?? false;
    },
  };
};
