import type { Node } from './ast';
import {
  CommentExpr,
  CallExpr,
  TagExpr,
  MemberExpr,
  StringLiteral,
  LiteralExpr,
} from './ast';

const PROPERTY_REG = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

export class Formatter {
  public format(ast: Node[]): string {
    const output = ast.reduce((acc, cur) => {
      if (cur instanceof TagExpr) {
        acc += this._formatTagExpr(cur);
      } else if (cur instanceof CommentExpr) {
        acc += this._formatCommentExpr(cur);
      } else if (cur instanceof MemberExpr) {
        acc += this._formatMemberExpr(cur);
      } else if (cur instanceof CallExpr) {
        acc += this._formatCallExpr(cur);
      } else {
        acc += cur.toString();
      }

      return acc;
    }, '');

    return output;
  }

  private _formatTagExpr(expr: TagExpr) {
    const open = expr.open.literal;
    const close = expr.close.literal;

    if (
      expr.expressions.length === 1 &&
      expr.expressions[0] instanceof CommentExpr &&
      expr.expressions[0].loc.start.line !== expr.expressions[0].loc.end.line
    ) {
      const comment = this._formatCommentExpr(expr.expressions[0]);
      return `${open}${comment}${close}`;
    }

    const body = this.format(expr.expressions);

    return `${open} ${body} ${close}`;
  }

  private _formatCommentExpr(expr: CommentExpr) {
    if (expr.loc.start.line !== expr.loc.end.line) {
      return `/*${expr.body}*/`;
    } else {
      return `/* ${expr.body.trim()} */`;
    }
  }

  private _formatMemberExpr(expr: MemberExpr) {
    const obj = this.format([expr.object]);

    if (expr.computed) {
      if (
        expr.property instanceof LiteralExpr &&
        expr.property.literal instanceof StringLiteral &&
        PROPERTY_REG.test(expr.property.literal.value)
      ) {
        return `${obj}.${expr.property.literal.value}`;
      } else {
        return `${obj}[${this.format([expr.property])}]`;
      }
    }

    return `${obj}.${this.format([expr.property])}`;
  }

  private _formatCallExpr(expr: CallExpr) {
    const f = (args: Node[]) => args.map((arg) => this.format([arg])).join(' ');

    if (expr.args.length > 0) {
      if (expr.pipe) {
        const first = this.format(expr.args.slice(0, 1));
        const args = f(expr.args.slice(1));

        return `${first} | ${expr.name}${args === '' ? '' : ' '}${args}`;
      } else {
        return `${expr.name} ${f(expr.args)}`;
      }
    }

    return expr.name;
  }
}
