import { CallExpr, IdentExpr, LiteralExpr, Node, RawExpr, TagExpr } from './ast';
import { Context } from './context';
import { Parser } from './parser';
import { tokenize } from './tokenize';

export class Compiler {
  public static compile(context: Context, input: string) {
    const parser = new Parser(tokenize(input));
    const compiler = new Compiler(context);

    return compiler.compile(parser.parse());
  }

  public constructor(private context: Context) {}

  public compile(ast: Node[]) {
    let output = '';

    for (const expr of ast) {
      if (expr instanceof RawExpr) {
        output += expr.toString();
      } else if (expr instanceof TagExpr) {
        output += this.compileTagExpr(expr);
      }
    }

    return output;
  }

  private compileTagExpr(tagExpr: TagExpr) {
    let output = '';

    for (const expr of tagExpr.expressions) {
      if (expr instanceof LiteralExpr) {
        output += this.compileLiteralExpr(expr);
      } else if (expr instanceof IdentExpr) {
        output += this.compileIdentExpr(expr);
      } else if (expr instanceof CallExpr) {
        output += this.compileCallExpr(expr);
      }
    }

    return output;
  }

  private compileIdentExpr(identExpr: IdentExpr) {
    const { vars, funcs } = this.context;
    const value = vars.get(identExpr.ident.name);
    const fn = funcs.get(identExpr.ident.name);

    if (value != null) {
      return value;
    }

    if (fn != null) {
      return fn(this.context);
    }

    throw new Error(`"${identExpr.ident.name}" identifier does not exist.`);
  }

  private compileLiteralExpr(literalExpr: LiteralExpr) {
    switch (typeof literalExpr.literal.value) {
      case 'string':
      case 'number':
        return `${literalExpr.literal.value}`;
        break;

      default:
        return '';
    }
  }

  private compileCallExpr(callExpr: CallExpr) {
    const { funcs } = this.context;
    const fn = funcs.get(callExpr.name);

    if (fn == null) {
      throw new Error(`"${callExpr.name}" function does not exist.`);
    }

    const args: any[] = callExpr.args.map((expr) => {
      if (expr instanceof LiteralExpr) {
        return expr.literal.value;
      } else if (expr instanceof IdentExpr) {
        return this.compileIdentExpr(expr);
      } else if (expr instanceof CallExpr) {
        return this.compileCallExpr(expr);
      }

      throw new Error(`"${expr}" is invalid argument`);
    });

    return fn(this.context, ...args);
  }
}
