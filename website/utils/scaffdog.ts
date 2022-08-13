import path from 'path';
import type { Template, VariableMap, File } from '@scaffdog/types';
import unified from 'unified';
import markdown from 'remark-parse';
import visit from 'unist-util-visit-parents';
import toString from 'mdast-util-to-string';
import { compile, createContext, extendContext } from '@scaffdog/engine';

const VARIABLES_SECTION_TITLE_REGEX = /^variables/i;
const VARIABLE_REGEX = /^([_$a-z][0-9a-z_$]*)\s*:\s*(.*)\s*$/i;

const parseVariable = (input: string): [key: string, value: string] => {
  const m = VARIABLE_REGEX.exec(input);
  if (m == null) {
    return ['', ''];
  }

  return [m[1], m[2]];
};

export type VariableSourceMap = Map<string, string>;

export type ExtractResult = {
  variables: VariableSourceMap;
  templates: Template[];
};

const extract = (input: string): ExtractResult => {
  const variables: VariableSourceMap = new Map();
  const templates: Template[] = [];
  const ast = unified().use(markdown).parse(input);

  let isInVariables = false;
  let filename: string | null = null;

  // collect templates
  visit(ast, (node) => {
    switch (node.type) {
      case 'heading': {
        if ((node as any).depth !== 1) {
          filename = null;
          break;
        }

        const text = toString(node).trim();
        if (!text) {
          filename = null;
          break;
        }

        if (VARIABLES_SECTION_TITLE_REGEX.test(text)) {
          isInVariables = true;
          filename = null;
          break;
        }

        filename = text;
        break;
      }

      case 'code': {
        if (filename != null) {
          templates.push({
            filename,
            content: toString(node).trim(),
          });

          filename = null;
        }
        break;
      }

      case 'list': {
        if (isInVariables) {
          visit(node, (child) => {
            if (child.type === 'listItem') {
              const [key, value] = parseVariable(toString(child).trim());
              if (key && value) {
                variables.set(key, value);
              }
            }
          });
        }
        break;
      }
    }
  });

  return {
    variables,
    templates,
  };
};

export type GenerateResult = File[];

export const generate = (
  input: string,
  inputs: VariableMap,
): GenerateResult => {
  const opts = {
    cwd: '',
    root: '',
    helpers: new Map(),
  };

  const context = createContext({
    cwd: opts.cwd,
    helpers: opts.helpers,
    variables: new Map([
      [
        'inputs',
        [...inputs].reduce(
          (l, [k, v]) => Object.assign(l, { [k]: v }),
          Object.create(null),
        ),
      ],
    ]),
  });

  const { templates, variables } = extract(input);

  for (const [key, value] of variables) {
    context.variables.set(key, compile(value, context));
  }

  return templates.map((template) => {
    const name = compile(template.filename, context);
    if (/^!/.test(name)) {
      const raw = name.slice(1);
      return {
        output: raw,
        filename: raw,
        content: template.content,
        skip: true,
      };
    }

    const absolute = path.resolve(opts.cwd, opts.root, name);
    const output = {
      absolute,
      relative: path.relative(opts.cwd, absolute),
    };

    const info = path.parse(output.relative);

    const vars: VariableMap = new Map();
    vars.set('cwd', opts.cwd);
    vars.set('output', {
      root: opts.root,
      path: output.relative,
      abs: output.absolute,
      name: info.name,
      base: info.base,
      ext: info.ext,
      dir: info.dir,
    });

    const ctx = extendContext(context, {
      variables: vars,
    });

    const content = compile(template.content, ctx);

    return {
      output: output.absolute,
      filename: name,
      content,
      skip: false,
    };
  });
};
