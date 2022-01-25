import { error } from '@scaffdog/error';
import type { Context, Variable } from '@scaffdog/types';
import { isPlainObject } from 'is-plain-object';
import type { Node } from './ast';
import {
  MemberExpr,
  CallExpr,
  IdentExpr,
  LiteralExpr,
  RawExpr,
  TagExpr,
  StringLiteral,
  NumberLiteral,
  NullLiteral,
  UndefinedLiteral,
  BooleanLiteral,
} from './ast';

export class Compiler {
  private _context: Context;
  private _source: string;

  public constructor(context: Context, source: string) {
    this._context = context;
    this._source = source;
  }

  public compile(ast: Node[]): string {
    const output: [string, boolean, boolean][] = [];

    for (const expr of ast) {
      if (expr instanceof RawExpr) {
        output.push([expr.toString(), false, false]);
      } else if (expr instanceof TagExpr) {
        output.push([
          this._compileTagExpr(expr),
          expr.isOpenTrim(),
          expr.isCloseTrim(),
        ]);
      }
    }

    return output.reduce((acc, cur, index, self) => {
      if (cur[1] === true) {
        acc = acc.trimEnd();
      }

      if (self[index - 1] != null && self[index - 1][2] === true) {
        acc += cur[0].trimStart();
      } else {
        acc += cur[0];
      }

      return acc;
    }, '');
  }

  private _compileTagExpr(tagExpr: TagExpr) {
    let output = '';

    for (const expr of tagExpr.expressions) {
      if (expr instanceof LiteralExpr) {
        output += this._compileLiteralExpr(expr);
      } else if (expr instanceof IdentExpr) {
        output += this._compileIdentExpr(expr);
      } else if (expr instanceof MemberExpr) {
        output += this._compileMemberExpr(expr);
      } else if (expr instanceof CallExpr) {
        output += this._compileCallExpr(expr);
      }
    }

    if (tagExpr.isOpenTrim()) {
      output = output.trimStart();
    }

    if (tagExpr.isCloseTrim()) {
      output = output.trimEnd();
    }

    return output;
  }

  private _compileIdentExpr(expr: IdentExpr) {
    const { variables, helpers } = this._context;

    if (variables.has(expr.ident.name)) {
      return variables.get(expr.ident.name)!;
    }

    if (helpers.has(expr.ident.name)) {
      return helpers.get(expr.ident.name)!(this._context);
    }

    throw this._error(`"${expr.ident.name}" identifier does not exist`, expr);
  }

  private _compileMemberExpr(expr: MemberExpr): Variable {
    let object: Variable | null = null;
    let property: Variable | keyof Variable | null = null;

    if (expr.object instanceof IdentExpr) {
      object = this._compileIdentExpr(expr.object);
    } else if (expr.object instanceof MemberExpr) {
      object = this._compileMemberExpr(expr.object);
    }

    if (expr.property instanceof IdentExpr) {
      if (expr.computed) {
        property = this._compileIdentExpr(expr.property);
      } else {
        property = expr.property.ident.name;
      }
    } else if (expr.property instanceof LiteralExpr) {
      if (
        expr.property.literal instanceof StringLiteral ||
        expr.property.literal instanceof NumberLiteral
      ) {
        property = expr.property.literal.value;
      } else {
        throw this._error(
          `[${expr.property.literal}] is invalid property`,
          expr.property,
        );
      }
    } else if (expr.property instanceof MemberExpr) {
      property = this._compileMemberExpr(expr.property);
    }

    if (object === null || property === null) {
      throw this._error(`"${expr.toString()}" is invalid member access`, expr);
    }

    switch (typeof property) {
      case 'string':
      case 'number':
        if (Array.isArray(object) || isPlainObject(object)) {
          return object[property as any] ?? '';
        }
        break;
    }

    return '';
  }

  private _compileLiteralExpr(expr: LiteralExpr) {
    if (
      expr.literal instanceof StringLiteral ||
      expr.literal instanceof NumberLiteral
    ) {
      return `${expr.literal.value}`;
    } else {
      return '';
    }
  }

  private _compileCallExpr(expr: CallExpr) {
    const { helpers } = this._context;
    const helper = helpers.get(expr.name);

    if (helper == null) {
      throw this._error(`"${expr.name}" function does not exist`, expr);
    }

    const args: any[] = expr.args.map((expr) => {
      if (expr instanceof LiteralExpr) {
        if (
          expr.literal instanceof StringLiteral ||
          expr.literal instanceof NumberLiteral ||
          expr.literal instanceof BooleanLiteral
        ) {
          return expr.literal.value;
        } else if (expr.literal instanceof NullLiteral) {
          return null;
        } else if (expr.literal instanceof UndefinedLiteral) {
          return undefined;
        }
      } else if (expr instanceof IdentExpr) {
        return this._compileIdentExpr(expr);
      } else if (expr instanceof MemberExpr) {
        return this._compileMemberExpr(expr);
      } else if (expr instanceof CallExpr) {
        return this._compileCallExpr(expr);
      }

      throw this._error(`${expr} is invalid argument`, expr);
    });

    return helper(this._context, ...args);
  }

  private _error(msg: string, node: Node) {
    return error(msg, {
      source: this._source,
      loc: node.loc,
    });
  }
}
