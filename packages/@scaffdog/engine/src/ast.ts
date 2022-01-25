import type { SourceLocation } from '@scaffdog/types';
import type { Token } from './tokens';

export type Node = {
  loc: SourceLocation;
  toString(): string;
};

export class CommentExpr implements Node {
  public constructor(public body: string, public loc: SourceLocation) {}
  public toString(): string {
    return `/* ${this.body} */`;
  }
}

export class Ident implements Node {
  public constructor(public name: string, public loc: SourceLocation) {}
  public toString(): string {
    return this.name;
  }
}

export class StringLiteral implements Node {
  public constructor(
    public value: string,
    public quote: string,
    public loc: SourceLocation,
  ) {}

  public toString(): string {
    return `${this.quote}${this.value}${this.quote}`;
  }
}

export class NumberLiteral implements Node {
  public constructor(public value: number, public loc: SourceLocation) {}
  public toString(): string {
    return this.value.toString();
  }
}

export class BooleanLiteral implements Node {
  public constructor(public value: boolean, public loc: SourceLocation) {}
  public toString(): string {
    return this.value.toString();
  }
}

export class UndefinedLiteral implements Node {
  public constructor(public loc: SourceLocation) {}
  public toString(): string {
    return 'undefined';
  }
}

export class NullLiteral implements Node {
  public constructor(public loc: SourceLocation) {}
  public toString(): string {
    return 'null';
  }
}

export class RawExpr implements Node {
  public constructor(public body: string, public loc: SourceLocation) {}
  public toString(): string {
    return this.body;
  }
}

export class IdentExpr implements Node {
  public loc: SourceLocation;
  public constructor(public ident: Ident) {
    this.loc = ident.loc;
  }

  public toString(): string {
    return this.ident.toString();
  }
}

export type Literal =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | UndefinedLiteral
  | NullLiteral;

export class LiteralExpr implements Node {
  public loc: SourceLocation;
  public constructor(public literal: Literal) {
    this.loc = literal.loc;
  }

  public toString(): string {
    return this.literal.toString();
  }
}

export type MemberObject = IdentExpr | MemberExpr;
export type MemberProperty = IdentExpr | LiteralExpr | MemberExpr;

export class MemberExpr implements Node {
  public loc: SourceLocation;
  public constructor(
    public object: MemberObject,
    public property: MemberProperty,
    public computed: boolean,
  ) {
    this.loc = {
      start: object.loc.start,
      end: property.loc.end,
    };
  }

  public toString(): string {
    const obj = this.object.toString();
    const prop = this.property.toString();
    return this.computed ? `${obj}[${prop}]` : `${obj}.${prop}`;
  }
}

export class CallExpr implements Node {
  public constructor(
    public name: string,
    public args: Node[],
    public pipe: boolean,
    public loc: SourceLocation,
  ) {}

  public toString(): string {
    const args = this.args.map((arg) => arg.toString()).join(', ');
    return `${this.name}(${args})`;
  }
}

export class TagExpr implements Node {
  public loc: SourceLocation;
  public constructor(
    public open: Token<'OPEN_TAG'>,
    public close: Token<'CLOSE_TAG'>,
    public expressions: Node[],
  ) {
    this.loc = {
      start: open.loc.start,
      end: open.loc.end,
    };
  }

  public isOpenTrim(): boolean {
    return this.open.literal.endsWith('-');
  }

  public isCloseTrim(): boolean {
    return this.close.literal.startsWith('-');
  }

  public toString(): string {
    return `${this.open.literal} ${this.expressions
      .map((expr) => expr.toString())
      .join('')} ${this.close.literal}`;
  }
}
