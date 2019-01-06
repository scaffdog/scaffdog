export enum TokenType {
  ILLEGAL,
  EOF,
  NULL,
  UNDEFINED,
  BOOLEAN,
  STRING,
  NUMBER,
  IDENT,
  PIPE,
  OPEN_TAG,
  CLOSE_TAG,
}

// TODO type-safe token...
export type Token<T, L> = {
  type: T;
  literal: L;
};

export type AnyToken = Token<any, any>;
export type IllegalToken = Token<TokenType.ILLEGAL, null>;
export type EofToken = Token<TokenType.EOF, null>;
export type NullToken = Token<TokenType.NULL, null>;
export type UndefinedToken = Token<TokenType.UNDEFINED, undefined>;
export type BooleanToken = Token<TokenType.BOOLEAN, boolean>;
export type StringToken = Token<TokenType.STRING, string>;
export type NumberToken = Token<TokenType.NUMBER, number>;
export type IdentToken = Token<TokenType.IDENT, string>;
export type PipeToken = Token<TokenType.IDENT, '|'>;
export type OpenTagToken = Token<TokenType.IDENT, '{{'>;
export type CloseTagToken = Token<TokenType.IDENT, '}}'>;

export function createToken<T, L>(type: T, literal: L) {
  return { type, literal };
}
