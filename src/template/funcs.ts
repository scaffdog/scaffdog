import * as cc from 'change-case';
import * as path from 'path';
import eval from 'safe-eval';
import { Context } from './context';

export type TemplateFunction = (context: Context, ...args: any[]) => string;

const funcs = new Map<string, TemplateFunction>();

funcs.set('camel', (_: Context, v: string) => cc.camel(v));
funcs.set('snake', (_: Context, v: string) => cc.snake(v));
funcs.set('pascal', (_: Context, v: string) => cc.pascal(v));
funcs.set('kebab', (_: Context, v: string) => cc.param(v));
funcs.set('constant', (_: Context, v: string) => cc.constant(v));
funcs.set('upper', (_: Context, v: string) => v.toUpperCase());
funcs.set('lower', (_: Context, v: string) => v.toLowerCase());

funcs.set('replace', (_: Context, v: string, pattern: string, replacement: string) =>
  v.replace(new RegExp(pattern, 'g'), replacement),
);

funcs.set('relative', (ctx: Context, to: string) => {
  const output = ctx.vars.get('output');
  if (output == null) {
    return '';
  }

  return path.relative(path.dirname(output), path.resolve(path.dirname(ctx.document.path), to));
});

funcs.set('eval', (ctx: Context, v: string, code?: string) => {
  const evalCode = code != null ? code : v;
  const context: { [key: string]: any } = {};

  for (const [key, value] of ctx.vars.entries()) {
    context[key] = value;
  }

  return eval(evalCode, context); // tslint:disable-line: no-eval
});

export { funcs };
