import type { Context } from '@scaffdog/types';
import { compile } from './compile.js';
import { parse } from './parser/index.js';

export const render = (source: string, context: Context): string => {
  const ast = parse(source, { tags: context.tags });
  return compile(ast, context);
};
