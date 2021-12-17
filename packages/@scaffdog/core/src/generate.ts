import path from 'path';
import { compile, createContext, extendContext } from '@scaffdog/engine';
import type {
  File,
  HelperMap,
  TagPair,
  Template,
  VariableMap,
} from '@scaffdog/types';

export type GenerateOptions = {
  cwd: string;
  root: string;
  helpers: HelperMap;
  tags?: TagPair;
};

export type GenerateResult = File[];

export const generate = (
  templates: Template[],
  variables: VariableMap,
  options: Partial<GenerateOptions> = {},
): GenerateResult => {
  const opts = {
    cwd: process.cwd(),
    root: '',
    helpers: new Map(),
    ...options,
  };

  opts.root = path.relative(opts.cwd, opts.root);

  return templates.map((template) => {
    const context = createContext({
      cwd: opts.cwd,
      helpers: opts.helpers,
      variables,
      tags: opts.tags,
    });

    const name = compile(template.filename, context);
    const absolute = path.resolve(opts.cwd, opts.root, name);
    const output = {
      absolute,
      relative: path.relative(opts.cwd, absolute),
    };

    const info = path.parse(output.relative);

    const vars: VariableMap = new Map();
    vars.set('cwd', opts.cwd);
    vars.set('output', {
      path: output.relative,
      abs: output.absolute,
      name: info.name,
      base: info.base,
      ext: info.ext,
      dir: info.dir,
    });

    const ctx = extendContext(context, {
      variables: vars,
    });

    const content = compile(template.content, ctx);

    return {
      output: output.absolute,
      filename: name,
      content,
    };
  });
};
