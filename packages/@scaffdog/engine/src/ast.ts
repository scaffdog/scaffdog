import type { Token } from './tokens';

export type Node = {
  toString(): string;
};

export class Ident implements Node {
  public constructor(public name: string) {}
  public toString(): string {
    return this.name;
  }
}

export class Literal implements Node {
  public constructor(
    public value: string | number | boolean | undefined | null,
  ) {}

  public toString(): string {
    return typeof this.value === 'string' ? `"${this.value}"` : `${this.value}`;
  }
}

export class RawExpr implements Node {
  public constructor(public value: string) {}
  public toString(): string {
    return this.value;
  }
}

export class IdentExpr implements Node {
  public constructor(public ident: Ident) {}
  public toString(): string {
    return this.ident.toString();
  }
}

export class LiteralExpr implements Node {
  public constructor(public literal: Literal) {}
  public toString(): string {
    return this.literal.toString();
  }
}

export class MemberExpr implements Node {
  public constructor(public object: Node, public property: Node) {}

  public toString(): string {
    return `${this.object.toString()}[${this.property.toString()}]`;
  }
}

export class CallExpr implements Node {
  public constructor(public name: string, public args: Node[]) {}
  public toString(): string {
    const args = this.args.map((arg) => arg.toString()).join(', ');
    return `${this.name}(${args})`;
  }
}

export class TagExpr implements Node {
  public constructor(
    public open: Token<'OPEN_TAG'>,
    public close: Token<'CLOSE_TAG'>,
    public expressions: Node[],
  ) {}

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
