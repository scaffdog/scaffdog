import type { TagPair } from '@scaffdog/types';
import type { ParseErrorStack } from './error.js';

/**
 * Parser
 */
export type ParseInput = readonly string[];

export type ParseState = {
  input: ParseInput;
  rest: ParseInput;
  offset: number;
  errors: ParseErrorStack;
  tags: TagPair;
};

export type ParseSuccess<T> = {
  type: 'success';
  data: T;
  committed: boolean;
  state: ParseState;
};

export type ParseError = {
  type: 'error';
  kind: 'error' | 'failure';
  committed: boolean;
  state: ParseState;
};

export type ParseResult<T> = Readonly<ParseSuccess<T> | ParseError>;

export type Parser<T> = (state: ParseState) => ParseResult<T>;

export type ParseData<T> = T extends Parser<infer T> ? T : never;

export const success = <T>(
  data: T,
  committed: boolean,
  state: ParseState,
): ParseSuccess<T> => ({
  type: 'success',
  data,
  committed,
  state,
});

export const error = (
  kind: 'error' | 'failure',
  committed: boolean,
  state: ParseState,
): ParseError => ({
  type: 'error',
  kind,
  committed,
  state,
});

/**
 * Option
 */
export type Some<T> = {
  state: 'some';
  value: T;
};

export type None = {
  state: 'none';
};

export type Option<T> = Some<T> | None;

export const some = <T>(value: T): Some<T> => ({
  state: 'some',
  value,
});

export const none = (): None => ({
  state: 'none',
});
