import path from 'path';
import type { Context, VariableMap } from '@scaffdog/types';
import type { Document } from './document';

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
  root: string;
  name: string;
};

export const createTemplateVariables = ({
  cwd,
  root,
  name,
}: CreateTemplateVariablesOptions): VariableMap => {
  const variables: VariableMap = new Map();

  const absolute = path.resolve(cwd, root, name);
  const relative = path.relative(cwd, absolute);
  const info = path.parse(relative);

  variables.set('cwd', cwd);
  variables.set('output', {
    root,
    path: relative,
    abs: absolute,
    name: info.name,
    base: info.base,
    ext: info.ext,
    dir: info.dir,
  });

  return variables;
};
