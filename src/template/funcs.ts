import * as cc from 'change-case';
import eval from 'safe-eval';
import { Context, TemplateFunction } from './compiler';

const funcs = new Map<string, TemplateFunction>();

funcs.set('camel', (_: Context, v: string) => cc.camel(v));
funcs.set('snake', (_: Context, v: string) => cc.snake(v));
funcs.set('pascal', (_: Context, v: string) => cc.pascal(v));
funcs.set('constant', (_: Context, v: string) => cc.constant(v));
funcs.set('upper', (_: Context, v: string) => v.toUpperCase());
funcs.set('lower', (_: Context, v: string) => v.toLowerCase());

funcs.set('replace', (_: Context, v: string, pattern: string, replacement: string) =>
  v.replace(new RegExp(pattern, 'g'), replacement),
);

funcs.set('eval', (ctx: Context, v: string, code?: string) => {
  const evalCode = code != null ? code : v;
  const context: { [key: string]: any } = {};

  for (const [key, value] of ctx.vars.entries()) {
    context[key] = value;
  }

  return eval(evalCode, context); // tslint:disable-line: no-eval
});

export { funcs };
