import { error } from '@scaffdog/error';
import type { TagPair } from '@scaffdog/types';
import type { Program } from '../ast.js';
import { createProgram } from '../ast.js';
import { defaults } from '../syntax.js';
import { concat, eof, map } from './combinators.js';
import { ParseErrorStack } from './error.js';
import { template } from './statements.js';
import type { Parser } from './types.js';

export type ProgramParser = (input: string) => Program;

const program: Parser<Program> = (state) => {
  return map(concat([template, eof]), ([body]) =>
    createProgram(body, state.input.join('')),
  )(state);
};

export type ParseOptions = {
  tags: TagPair;
};

export const parse = (source: string, options?: Partial<ParseOptions>) => {
  const result = program({
    input: [...source],
    rest: [],
    offset: 0,
    errors: ParseErrorStack.from([]),
    tags: options?.tags ?? defaults.tags,
  });

  if (result.type === 'error') {
    const err = result.state.errors.latest();
    const msg = err?.message ?? 'Unexpected end of input';
    const range = err?.range ?? [result.state.offset, result.state.offset];

    throw error(`SyntaxError: ${msg}`, {
      source,
      range,
    });
  }

  return result.data;
};
