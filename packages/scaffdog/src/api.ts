import { dirname, resolve } from 'path';
import type { LoadConfigResult } from '@scaffdog/config';
import { loadConfig } from '@scaffdog/config';
import { compile, createContext, extendContext } from '@scaffdog/engine';
import type { Context, ResolvedConfig, VariableRecord } from '@scaffdog/types';
import type { File } from './file.js';
import { helpers } from './helpers.js';
import type { Library } from './lib/index.js';
import type { Document } from './lib/document.js';
import { assignGlobalVariables, createTemplateVariables } from './variables.js';

/**
 * Public API
 */
export type GenerateInputsResolver = (
  context: Context,
) => Promise<VariableRecord>;

export type GenerateInputs = VariableRecord | GenerateInputsResolver;

export type GenerateOptions = {
  inputs?: GenerateInputs;
};

export type Scaffdog = {
  path: {
    project: string;
    config: string;
  };
  config: ResolvedConfig;
  list: () => Promise<Document[]>;
  generate: (
    document: Document,
    output: string,
    options?: GenerateOptions,
  ) => Promise<File[]>;
};

/**
 * createScaffdog
 */
export type ScaffdogFactoryOptions = LoadConfigResult &
  Partial<{
    cwd: string;
  }>;

export type ScaffdogFactory = (options: ScaffdogFactoryOptions) => Scaffdog;

/**
 * loadScaffdog
 */
export type ScaffdogLoaderOptions = {
  cwd: string;
};

export type ScaffdogLoader = (
  path: string,
  options?: Partial<ScaffdogLoaderOptions>,
) => Promise<Scaffdog>;

/**
 * Initializer
 */
export type ScaffdogInitializerOptions = {
  lib: Library;
};

export type ScaffdogInitializer = {
  createScaffdog: ScaffdogFactory;
  loadScaffdog: ScaffdogLoader;
};

export const createScaffdogInitializer = ({
  lib,
}: ScaffdogInitializerOptions): ScaffdogInitializer => {
  const createScaffdog: ScaffdogInitializer['createScaffdog'] = ({
    filepath,
    config,
    cwd = process.cwd(),
  }) => ({
    path: {
      project: dirname(filepath),
      config: filepath,
    },
    config,

    list: async () => {
      return await lib.document.resolve(dirname(filepath), config.files, {
        tags: config.tags,
      });
    },

    generate: async (document, output, options = {}) => {
      const context = createContext({
        cwd,
        variables: config.variables,
        helpers: new Map([...config.helpers, ...helpers]),
        tags: config.tags,
      });

      // set variables
      assignGlobalVariables(context, {
        cwd,
        document,
      });

      // resolve inputs
      let inputs: VariableRecord;
      if (typeof options.inputs === 'function') {
        inputs = await options.inputs(context);
      } else {
        inputs = options.inputs ?? {};
      }

      context.variables.set('inputs', inputs);

      // generate
      const files: File[] = [];

      for (const [key, ast] of document.variables) {
        context.variables.set(key, compile(ast, context));
      }

      for (const tpl of document.templates) {
        const filename = compile(tpl.filename, context);
        if (/^!/.test(filename)) {
          const name = filename.slice(1);
          files.push({
            skip: true,
            path: resolve(output, filename.slice(1)),
            name,
            content: '',
          });
          continue;
        }

        const ctx = extendContext(context, {
          variables: createTemplateVariables({
            cwd,
            dir: output,
            name: filename,
          }),
        });

        files.push({
          skip: false,
          path: resolve(output, filename),
          name: filename,
          content: compile(tpl.content, ctx),
        });
      }

      return files;
    },
  });

  return {
    createScaffdog,

    loadScaffdog: async (path, options) => {
      const result = loadConfig(path);

      return createScaffdog({
        ...result,
        cwd: options?.cwd,
      });
    },
  };
};
