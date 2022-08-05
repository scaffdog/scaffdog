import { error } from '@scaffdog/error';
import type { TagPair } from '@scaffdog/types';
import type { Program } from '../ast';
import { createProgram } from '../ast';
import { defaults } from '../syntax';
import { concat, eof, map } from './combinators';
import { ParseErrorStack } from './error';
import { template } from './statements';
import type { Parser } from './types';

export type ProgramParser = (input: string) => Program;

const program: Parser<Program> = map(concat([template, eof]), ([body]) =>
  createProgram(body),
);

export type CreateParserOptions = {
  tags: TagPair;
};

export const createParser =
  (options?: Partial<CreateParserOptions>): ProgramParser =>
  (input) => {
    const result = program({
      input: [...input],
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
        source: input,
        range,
      });
    }

    return result.data;
  };
