import { CallExpr, Ident, IdentExpr, Literal, LiteralExpr, Node, RawExpr, TagExpr } from './ast';
import { AnyToken, createToken, TokenType } from './tokens';

const eofToken = createToken(TokenType.EOF, null);

export class Parser {
  private tokens: AnyToken[];
  private length: number;
  private pos: number = 0;
  private current: AnyToken = eofToken;
  private next: AnyToken = eofToken;

  public constructor(tokens: AnyToken[]) {
    this.tokens = tokens;
    this.length = tokens.length;

    this.bump();
  }

  public parse() {
    const ast: Node[] = [];

    while (!this.endOfTokens()) {
      switch (this.current.type) {
        case TokenType.OPEN_TAG:
          ast.push(this.parseTagExpr());
          break;

        case TokenType.STRING:
          ast.push(new RawExpr(this.current.literal));
          break;
      }

      this.bump();
    }

    return ast;
  }

  private endOfTokens() {
    return this.current.type === TokenType.EOF;
  }

  private bump() {
    if (this.pos < this.length) {
      this.current = this.tokens[this.pos];
      this.pos++;
    } else {
      this.current = eofToken;
    }

    if (this.pos < this.length) {
      this.next = this.tokens[this.pos];
    } else {
      this.next = eofToken;
    }
  }

  private parseTagExpr() {
    const expressions: Node[] = [];
    let passedPipe = false;

    this.bump();

    while (!this.endOfTokens()) {
      switch (this.current.type) {
        case TokenType.IDENT:
          switch (this.next.type) {
            case TokenType.NULL:
            case TokenType.UNDEFINED:
            case TokenType.BOOLEAN:
            case TokenType.STRING:
            case TokenType.NUMBER:
            case TokenType.IDENT:
              expressions.push(this.parseCallExpr());
              break;

            // case TokenType.IDENT:
            //   throw new Error('unexpected syntax (invalid identitifer)');

            default:
              if (passedPipe) {
                expressions.push(new CallExpr(this.current.literal, []));
              } else {
                expressions.push(new IdentExpr(new Ident(this.current.literal)));
              }
          }
          break;

        case TokenType.NULL:
        case TokenType.UNDEFINED:
        case TokenType.BOOLEAN:
        case TokenType.STRING:
        case TokenType.NUMBER:
          expressions.push(new LiteralExpr(new Literal(this.current.literal)));
          break;

        case TokenType.PIPE:
          passedPipe = true;
          break;

        case TokenType.CLOSE_TAG:
          return new TagExpr(this.combineTagExpressions(expressions));
      }

      this.bump();
    }

    throw new Error('unexpected syntax');
  }

  private combineTagExpressions(expressions: Node[]) {
    const copy = [...expressions];
    const expr = copy.shift();

    if (expr == null) {
      return [];
    }

    const combined = copy.reduce((acc, cur) => {
      if (cur instanceof CallExpr) {
        cur.args = [acc, ...(cur.args == null ? [] : cur.args)];

        return cur;
      }

      return acc;
    }, expr);

    return [combined];
  }

  private parseCallExpr() {
    const name = this.current.literal;
    const args: Node[] = [];

    this.bump();

    while (!this.endOfTokens()) {
      if (this.current.type === TokenType.IDENT) {
        args.push(new IdentExpr(new Ident(this.current.literal)));
      } else {
        args.push(new LiteralExpr(new Literal(this.current.literal)));
      }

      switch (this.next.type) {
        case TokenType.CLOSE_TAG:
        case TokenType.PIPE:
          return new CallExpr(name as string, args);
        default:
          this.bump();
      }
    }

    throw new Error('unexpected syntax');
  }
}
