import type { Context } from '@scaffdog/types';
import { Compiler } from './compiler';
import { Parser } from './parser';
import { tokenize } from './tokenize';

export const compile = (input: string, context: Context): string => {
  const tokens = tokenize(input, {
    tags: context.tags,
  });

  const parser = new Parser(tokens, input);
  const compiler = new Compiler(context, input);
  const ast = parser.parse();
  const output = compiler.compile(ast);

  return output;
};
