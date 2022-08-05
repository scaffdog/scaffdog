import type { SourceRange } from '@scaffdog/types';
import { defaults } from '../syntax';
import type { ParseErrorEntry } from './error';
import { ParseErrorStack } from './error';
import type { Parser, ParseResult, ParseState } from './types';

export const range = (start: number, end: number): SourceRange => [start, end];

export type ParserTestSuccessEntry = [
  type: 'success',
  input: string,
  data: any,
  rest: string,
  offset: number,
  committed: boolean,
  errors: ParseErrorEntry[],
];

export type ParserTestErrorEntry = [
  type: 'error' | 'failure',
  input: string,
  rest: string,
  offset: number,
  committed: boolean,
  errors: ParseErrorEntry[],
];

export type ParserTestEntry = ParserTestSuccessEntry | ParserTestErrorEntry;

export const state = (
  input: string,
  rest: string,
  offset: number,
  errors: ParseErrorEntry[],
): ParseState => ({
  input: [...input],
  rest: [...rest],
  offset,
  errors: ParseErrorStack.from(errors),
  tags: defaults.tags,
});

export const parse = (p: Parser<any>, input: string): ParseResult<any> => {
  return p(state(input, '', 0, []));
};

export const result = (...args: ParserTestEntry): ParseResult<any> => {
  switch (args[0]) {
    case 'success': {
      const [, input, data, rest, offset, committed, errors] = args;
      return {
        type: 'success',
        data,
        committed,
        state: state(input, rest, offset, errors),
      };
    }
    case 'error':
    case 'failure': {
      const [kind, input, rest, offset, committed, errors] = args;
      return {
        type: 'error',
        kind,
        committed,
        state: state(input, rest, offset, errors),
      };
    }
  }
};
