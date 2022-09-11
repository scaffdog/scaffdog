import type { Context } from '@scaffdog/types';
import { compile } from './compile';
import { parse } from './parser';

export const render = (source: string, context: Context): string => {
  const ast = parse(source, { tags: context.tags });
  return compile(ast, context);
};
