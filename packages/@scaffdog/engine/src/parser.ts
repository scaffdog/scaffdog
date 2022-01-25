import { error } from '@scaffdog/error';
import type { Node, MemberObject, MemberProperty } from './ast';
import {
  BooleanLiteral,
  CallExpr,
  CommentExpr,
  Ident,
  IdentExpr,
  LiteralExpr,
  MemberExpr,
  NullLiteral,
  NumberLiteral,
  RawExpr,
  StringLiteral,
  TagExpr,
  UndefinedLiteral,
} from './ast';
import type { AnyToken, Token } from './tokens';
import { createToken } from './tokens';

const eofToken = createToken('EOF', null, {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
});

export class Parser {
  private _tokens: AnyToken[];
  private _source: string;
  private _length: number;
  private _pos = 0;
  private _current: AnyToken = eofToken;
  private _next: AnyToken = eofToken;

  public constructor(tokens: AnyToken[], source: string) {
    this._tokens = tokens;
    this._source = source;
    this._length = tokens.length;

    this._bump();
  }

  public parse(): Node[] {
    const ast: Node[] = [];

    while (!this._endOfTokens()) {
      switch (this._current.type) {
        case 'OPEN_TAG':
          ast.push(this._parseTagExpr());
          break;

        case 'STRING':
          ast.push(new RawExpr(this._current.literal.value, this._current.loc));
          break;
      }

      this._bump();
    }

    return ast;
  }

  private _endOfTokens() {
    return this._current.type === 'EOF';
  }

  private _bump() {
    if (this._pos < this._length) {
      this._current = this._tokens[this._pos];
      this._pos++;
    } else {
      this._current = eofToken;
    }

    if (this._pos < this._length) {
      this._next = this._tokens[this._pos];
    } else {
      this._next = eofToken;
    }
  }

  private _parseTagExpr() {
    const openTag = this._current as Token<'OPEN_TAG'>;
    const expressions: Node[] = [];
    let passedPipe = false;

    this._bump();

    while (!this._endOfTokens()) {
      switch (this._current.type) {
        case 'IDENT':
          switch (this._next.type) {
            case 'NULL':
            case 'UNDEFINED':
            case 'BOOLEAN':
            case 'STRING':
            case 'NUMBER':
            case 'IDENT':
              expressions.push(this._parseCallExpr(passedPipe));
              break;

            case 'DOT':
            case 'OPEN_BRACKET': {
              const object = new IdentExpr(
                new Ident(this._current.literal, this._current.loc),
              );
              this._bump();
              expressions.push(this._parseMemberExpr(object));
              break;
            }

            default:
              if (passedPipe) {
                expressions.push(
                  new CallExpr(
                    this._current.literal,
                    [],
                    true,
                    this._current.loc,
                  ),
                );
              } else {
                expressions.push(
                  new IdentExpr(
                    new Ident(this._current.literal, this._current.loc),
                  ),
                );
              }
          }
          break;

        case 'NULL':
        case 'UNDEFINED':
        case 'BOOLEAN':
        case 'NUMBER':
        case 'STRING':
          expressions.push(this._parseLiteralExpr());
          break;

        case 'COMMENT':
          expressions.push(
            new CommentExpr(this._current.literal, this._current.loc),
          );
          break;

        case 'PIPE':
          passedPipe = true;
          break;

        case 'CLOSE_TAG':
          return new TagExpr(
            openTag,
            this._current,
            this._combineTagExpressions(expressions),
          );
      }

      this._bump();
    }

    throw this._error('unexpected syntax', this._current);
  }

  private _combineTagExpressions(expressions: Node[]) {
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

  private _parseMemberExpr(object: MemberObject): MemberExpr {
    const computed = this._current.type === 'OPEN_BRACKET';
    let property: MemberProperty | null = null;

    this._bump();

    if (computed) {
      switch (this._current.type) {
        case 'NUMBER':
        case 'STRING':
          property = this._parseLiteralExpr();
          break;

        case 'IDENT':
          property = new IdentExpr(
            new Ident(this._current.literal, this._current.loc),
          );
          switch (this._next.type) {
            case 'DOT':
            case 'OPEN_BRACKET':
              this._bump();
              return new MemberExpr(
                object,
                this._parseMemberExpr(property),
                true,
              );
          }
          break;

        default:
          throw this._error(
            'string, number or identifier literal expected',
            this._current,
          );
      }

      if (this._next.type !== 'CLOSE_BRACKET') {
        throw this._error('"]" expected', this._next);
      }

      this._bump();
    } else {
      switch (this._current.type) {
        case 'IDENT':
          property = new IdentExpr(
            new Ident(this._current.literal, this._current.loc),
          );
          break;

        default:
          throw this._error(`unexpected syntax`, this._current);
      }
    }

    switch (this._next.type) {
      case 'OPEN_BRACKET':
      case 'DOT':
        this._bump();
        return this._parseMemberExpr(
          new MemberExpr(object, property, computed),
        );
    }

    if (property != null) {
      return new MemberExpr(object, property, computed);
    }

    throw this._error(`unexpected syntax`, this._current);
  }

  private _parseCallExpr(passedPipe: boolean) {
    const name = this._current.literal;
    const loc = this._current.loc;
    const args: Node[] = [];

    this._bump();

    while (!this._endOfTokens()) {
      switch (this._current.type) {
        case 'IDENT': {
          const ident = new IdentExpr(
            new Ident(this._current.literal, this._current.loc),
          );

          switch (this._next.type) {
            case 'DOT':
            case 'OPEN_BRACKET':
              this._bump();
              args.push(this._parseMemberExpr(ident));
              break;

            default:
              args.push(ident);
              break;
          }
          break;
        }

        case 'NULL':
        case 'UNDEFINED':
        case 'BOOLEAN':
        case 'NUMBER':
        case 'STRING':
          args.push(this._parseLiteralExpr());
          break;
      }

      switch (this._next.type) {
        case 'CLOSE_TAG':
        case 'PIPE':
          return new CallExpr(name as string, args, passedPipe, loc);
        default:
          this._bump();
      }
    }

    throw this._error(`unexpected syntax`, this._current);
  }

  private _parseLiteralExpr() {
    return new LiteralExpr(this._parseLiteral());
  }

  private _parseLiteral() {
    switch (this._current.type) {
      case 'NULL':
        return new NullLiteral(this._current.loc);

      case 'UNDEFINED':
        return new UndefinedLiteral(this._current.loc);

      case 'BOOLEAN':
        return new BooleanLiteral(this._current.literal, this._current.loc);

      case 'NUMBER':
        return new NumberLiteral(this._current.literal, this._current.loc);

      case 'STRING':
        return new StringLiteral(
          this._current.literal.value,
          this._current.literal.quote,
          this._current.loc,
        );
    }

    throw this._error('unexpected syntax', this._current);
  }

  private _error(msg: string, token: AnyToken) {
    return error(msg, {
      source: this._source,
      loc: token.loc,
    });
  }
}
