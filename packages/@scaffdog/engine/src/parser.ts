import { error } from '@scaffdog/error';
import type { Node } from './ast';
import {
  MemberExpr,
  CallExpr,
  Ident,
  IdentExpr,
  Literal,
  LiteralExpr,
  RawExpr,
  TagExpr,
} from './ast';
import type { AnyToken, Token } from './tokens';
import { createToken } from './tokens';

const eofToken = createToken(
  'EOF',
  null,
  { line: 0, column: 0 },
  { line: 0, column: 0 },
);

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
          ast.push(new RawExpr(this._current.literal));
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
              expressions.push(this._parseCallExpr());
              break;

            case 'DOT':
            case 'OPEN_BRACKET': {
              const object = new IdentExpr(new Ident(this._current.literal));
              this._bump();
              expressions.push(this._parseMemberExpr(object));
              break;
            }

            default:
              if (passedPipe) {
                expressions.push(new CallExpr(this._current.literal, []));
              } else {
                expressions.push(
                  new IdentExpr(new Ident(this._current.literal)),
                );
              }
          }
          break;

        case 'NULL':
        case 'UNDEFINED':
        case 'BOOLEAN':
        case 'STRING':
        case 'NUMBER':
          expressions.push(new LiteralExpr(new Literal(this._current.literal)));
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

  private _parseMemberExpr(object: Node): MemberExpr {
    const isBracket = this._current.type === 'OPEN_BRACKET';
    let property: Node | null = null;

    this._bump();

    if (isBracket) {
      switch (this._current.type) {
        case 'STRING':
        case 'NUMBER':
          property = new LiteralExpr(new Literal(this._current.literal));
          break;

        case 'IDENT':
          property = new IdentExpr(new Ident(this._current.literal));
          break;

        default:
          throw this._error(
            'string, number or identifier literal expected',
            this._current,
          );
      }

      switch (this._next.type) {
        case 'DOT':
        case 'OPEN_BRACKET':
          this._bump();
          return new MemberExpr(object, this._parseMemberExpr(property));
      }

      if (this._next.type !== 'CLOSE_BRACKET') {
        throw this._error('"]" expected', this._next);
      }

      this._bump();

      if ((this._next as AnyToken).type === 'OPEN_BRACKET') {
        this._bump();
        return this._parseMemberExpr(new MemberExpr(object, property));
      }
    } else {
      switch (this._current.type) {
        case 'IDENT':
          property = new LiteralExpr(new Literal(this._current.literal));
          break;

        default:
          throw this._error(`unexpected syntax`, this._current);
      }

      if (this._next.type === 'DOT') {
        this._bump();
        return this._parseMemberExpr(new MemberExpr(object, property));
      }
    }

    if (property != null) {
      return new MemberExpr(object, property);
    }

    throw this._error(`unexpected syntax`, this._current);
  }

  private _parseCallExpr() {
    const name = this._current.literal;
    const args: Node[] = [];

    this._bump();

    while (!this._endOfTokens()) {
      if (this._current.type === 'IDENT') {
        args.push(new IdentExpr(new Ident(this._current.literal)));
      } else {
        args.push(new LiteralExpr(new Literal(this._current.literal)));
      }

      switch (this._next.type) {
        case 'CLOSE_TAG':
        case 'PIPE':
          return new CallExpr(name as string, args);
        default:
          this._bump();
      }
    }

    throw this._error(`unexpected syntax`, this._current);
  }

  private _error(msg: string, token: AnyToken) {
    return error(msg, {
      source: this._source,
      start: token.start,
      end: token.end,
    });
  }
}
