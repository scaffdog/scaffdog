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
} from './ast';

export class Compiler {
  private _context: Context;

  public constructor(context: Context) {
    this._context = context;
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
        acc = acc.trimRight();
      }

      if (self[index - 1] != null && self[index - 1][2] === true) {
        acc += cur[0].trimLeft();
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
      output = output.trimLeft();
    }

    if (tagExpr.isCloseTrim()) {
      output = output.trimRight();
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

    throw new Error(`"${expr.ident.name}" identifier does not exist.`);
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
      property = this._compileIdentExpr(expr.property);
    } else if (expr.property instanceof LiteralExpr) {
      switch (typeof expr.property.literal.value) {
        case 'string':
        case 'number':
          property = expr.property.literal.value;
          break;

        default:
          throw new Error(`[${expr.property.literal}] is invalid property`);
      }
    } else if (expr.property instanceof MemberExpr) {
      property = this._compileMemberExpr(expr.property);
    }

    if (object === null || property === null) {
      throw new Error(`"${expr.toString()}" is invalid member access`);
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
    switch (typeof expr.literal.value) {
      case 'string':
      case 'number':
        return `${expr.literal.value}`;

      default:
        return '';
    }
  }

  private _compileCallExpr(expr: CallExpr) {
    const { helpers } = this._context;
    const helper = helpers.get(expr.name);

    if (helper == null) {
      throw new Error(`"${expr.name}" function does not exist.`);
    }

    const args: any[] = expr.args.map((expr) => {
      if (expr instanceof LiteralExpr) {
        return expr.literal.value;
      } else if (expr instanceof IdentExpr) {
        return this._compileIdentExpr(expr);
      } else if (expr instanceof MemberExpr) {
        return this._compileMemberExpr(expr);
      } else if (expr instanceof CallExpr) {
        return this._compileCallExpr(expr);
      }

      throw new Error(`"${expr}" is invalid argument`);
    });

    return helper(this._context, ...args);
  }
}
