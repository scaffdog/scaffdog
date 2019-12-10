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

export type TokenMap = {
  [TokenType.ILLEGAL]: null;
  [TokenType.EOF]: null;
  [TokenType.NULL]: null;
  [TokenType.UNDEFINED]: undefined;
  [TokenType.BOOLEAN]: boolean;
  [TokenType.STRING]: string;
  [TokenType.NUMBER]: number;
  [TokenType.IDENT]: string;
  [TokenType.PIPE]: string;
  [TokenType.OPEN_TAG]: string;
  [TokenType.CLOSE_TAG]: string;
};

export type Loc = {
  line: number;
  column: number;
};

export type Token<T extends keyof TokenMap> = {
  type: T;
  literal: TokenMap[T];
  start: Loc;
  end: Loc;
};

export type AnyToken =
  | Token<TokenType.ILLEGAL>
  | Token<TokenType.EOF>
  | Token<TokenType.NULL>
  | Token<TokenType.UNDEFINED>
  | Token<TokenType.BOOLEAN>
  | Token<TokenType.STRING>
  | Token<TokenType.NUMBER>
  | Token<TokenType.IDENT>
  | Token<TokenType.PIPE>
  | Token<TokenType.OPEN_TAG>
  | Token<TokenType.CLOSE_TAG>;

export function createToken<T extends keyof TokenMap>(type: T, literal: TokenMap[T], start: Loc, end: Loc) {
  return {
    type,
    literal,
    start,
    end,
  };
}
