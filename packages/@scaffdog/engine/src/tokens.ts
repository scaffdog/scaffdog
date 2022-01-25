import type { SourceLocation } from '@scaffdog/types';

export type TokenMap = {
  ILLEGAL: null;
  EOF: null;
  COMMENT: string;
  NULL: null;
  UNDEFINED: undefined;
  BOOLEAN: boolean;
  STRING: {
    quote: string;
    value: string;
  };
  NUMBER: number;
  IDENT: string;
  DOT: string;
  OPEN_BRACKET: string;
  CLOSE_BRACKET: string;
  PIPE: string;
  OPEN_TAG: string;
  CLOSE_TAG: string;
};

export type TokenType = keyof TokenMap;

export type Token<T extends TokenType> = {
  type: T;
  literal: TokenMap[T];
  loc: SourceLocation;
};

export type AnyToken = {
  [P in TokenType]: Token<P>;
}[TokenType];

export const createToken = <T extends TokenType>(
  type: T,
  literal: TokenMap[T],
  loc: SourceLocation,
): Token<T> => ({
  type,
  literal,
  loc,
});
