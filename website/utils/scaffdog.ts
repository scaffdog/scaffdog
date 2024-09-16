import path from 'path';
import { extract } from '@scaffdog/core';
import type { HelperMap, Variable } from '@scaffdog/types';
import {
  compile as engineCompile,
  createContext,
  extendContext,
  defineHelper,
} from '@scaffdog/engine';

type ShadowRealmConstructor = {
  new (): ShadowRealm;
};

type Primitive = undefined | null | boolean | number | string;

type Callable = (...args: never) => unknown;

export type ShadowRealm = {
  evaluate: (sourceText: string) => Primitive | Callable;
  importValue: (
    specifier: string,
    bindingName: string,
  ) => Promise<Primitive | Callable>;
};

const helpers: HelperMap = new Map();

defineHelper<[v: string, code?: string]>(helpers, 'eval', (ctx, v, code) => {
  const ShadowRealm = (globalThis as any).ShadowRealm as
    | ShadowRealmConstructor
    | undefined;
  if (ShadowRealm == null) {
    throw new Error('Running `eval` requires `ShadowRealm` support.');
  }

  const evalCode = code != null ? code : v;
  const realm = new ShadowRealm();
  const vars = Array.from(ctx.variables.entries())
    .map(([key, value]) => `let ${key} = ${JSON.stringify(value)};`)
    .join('\n');

  return String(realm.evaluate(`${vars}\n${evalCode}`));
});

export type File = {
  skip: boolean;
  path: string;
  content: string;
};

export const compile = (
  source: string,
  inputs: Record<string, Variable>,
): File[] => {
  const { variables, templates } = extract(source, {});
  const cwd = '/workspace';
  const context = createContext({
    cwd,
    helpers,
  });

  context.variables.set('cwd', cwd);
  context.variables.set('inputs', inputs);
  context.variables.set('document', {
    name: 'playground.md',
    dir: '.scaffdog',
    path: path.join(cwd, '.scaffdog'),
  });

  for (const [key, ast] of variables) {
    context.variables.set(key, engineCompile(ast, context));
  }

  return templates.map((tpl) => {
    const filename = engineCompile(tpl.filename, context);
    if (/^!/.test(filename)) {
      return {
        skip: true,
        path: path.resolve(cwd, filename.slice(1)),
        content: '',
      };
    }

    const absolute = path.resolve(cwd, filename);
    const relative = path.relative(cwd, absolute);
    const info = path.parse(relative);

    const ctx = extendContext(context, {
      variables: new Map([
        [
          'output',
          {
            root: '.',
            path: filename,
            abs: absolute,
            name: info.name,
            base: info.base,
            ext: info.ext,
            dir: info.dir,
          },
        ],
      ]),
    });

    return {
      skip: false,
      path: filename,
      content: engineCompile(tpl.content, ctx),
    };
  });
};
