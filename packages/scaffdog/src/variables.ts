import path from 'path';
import type { Context, VariableMap } from '@scaffdog/types';
import type { Document } from './lib/document.js';

export type AssignGlobalVariablesOptions = {
  cwd: string;
  document: Document;
};

export const assignGlobalVariables = (
  context: Context,
  { cwd, document }: AssignGlobalVariablesOptions,
): void => {
  context.variables.set('cwd', cwd);

  context.variables.set('document', {
    name: document.name,
    dir: path.dirname(document.path),
    path: document.path,
  });
};

export type CreateTemplateVariablesOptions = {
  cwd: string;
  dir: string;
  name: string;
};

export const createTemplateVariables = ({
  cwd,
  dir,
  name,
}: CreateTemplateVariablesOptions): VariableMap => {
  const absolute = path.resolve(dir, name);
  const relative = path.relative(cwd, absolute);
  const info = path.parse(relative);

  const variables: VariableMap = new Map([
    [
      'output',
      {
        root: info.dir /** @deprecated Use `output.dir` instead of `output.root` */,
        path: relative,
        abs: absolute,
        name: info.name,
        base: info.base,
        ext: info.ext,
        dir: info.dir,
      },
    ],
  ]);

  return variables;
};
