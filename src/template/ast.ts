// tslint:disable: max-classes-per-file
export interface Node {
  toString(): string;
}

export class Ident implements Node {
  public constructor(public name: string) {}
  public toString() {
    return this.name;
  }
}

export class Literal implements Node {
  public constructor(public value: string | number | boolean | undefined | null) {}
  public toString() {
    return typeof this.value === 'string' ? `"${this.value}"` : `${this.value}`;
  }
}

export class RawExpr implements Node {
  public constructor(public value: string) {}
  public toString() {
    return this.value;
  }
}

export class IdentExpr implements Node {
  public constructor(public ident: Ident) {}
  public toString() {
    return this.ident.toString();
  }
}

export class LiteralExpr implements Node {
  public constructor(public literal: Literal) {}
  public toString() {
    return this.literal.toString();
  }
}

export class CallExpr implements Node {
  public constructor(public name: string, public args: Node[]) {}
  public toString() {
    const args = this.args.map((arg) => arg.toString()).join(', ');

    return `${this.name}(${args})`;
  }
}

export class TagExpr implements Node {
  public constructor(public expressions: Node[]) {}

  public toString() {
    return `{{ ${this.expressions.map((expr) => expr.toString()).join('')} }}`;
  }
}
