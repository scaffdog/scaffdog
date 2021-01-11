import type { Context } from '@scaffdog/types';
import { Compiler } from './compiler';
import { Parser } from './parser';
import { tokenize } from './tokenize';

export const compile = (input: string, context: Context): string => {
  const parser = new Parser(tokenize(input), input);
  const compiler = new Compiler(context);
  const ast = parser.parse();
  const output = compiler.compile(ast);

  return output;
};
