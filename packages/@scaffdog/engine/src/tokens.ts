export type TokenType =
  | 'ILLEGAL'
  | 'EOF'
  | 'NULL'
  | 'UNDEFINED'
  | 'BOOLEAN'
  | 'STRING'
  | 'NUMBER'
  | 'IDENT'
  | 'DOT'
  | 'OPEN_BRACKET'
  | 'CLOSE_BRACKET'
  | 'PIPE'
  | 'OPEN_TAG'
  | 'CLOSE_TAG';

export type TokenMap = {
  ILLEGAL: null;
  EOF: null;
  NULL: null;
  UNDEFINED: undefined;
  BOOLEAN: boolean;
  STRING: string;
  NUMBER: number;
  IDENT: string;
  DOT: string;
  OPEN_BRACKET: string;
  CLOSE_BRACKET: string;
  PIPE: string;
  OPEN_TAG: string;
  CLOSE_TAG: string;
};

export type Loc = {
  line: number;
  column: number;
};

export type Token<T extends TokenType> = {
  type: T;
  literal: TokenMap[T];
  start: Loc;
  end: Loc;
};

export type AnyToken =
  | Token<'ILLEGAL'>
  | Token<'EOF'>
  | Token<'NULL'>
  | Token<'UNDEFINED'>
  | Token<'BOOLEAN'>
  | Token<'STRING'>
  | Token<'NUMBER'>
  | Token<'IDENT'>
  | Token<'DOT'>
  | Token<'OPEN_BRACKET'>
  | Token<'CLOSE_BRACKET'>
  | Token<'PIPE'>
  | Token<'OPEN_TAG'>
  | Token<'CLOSE_TAG'>;

export const createToken = <T extends TokenType>(
  type: T,
  literal: TokenMap[T],
  start: Loc,
  end: Loc,
): Token<T> => ({
  type,
  literal,
  start,
  end,
});
