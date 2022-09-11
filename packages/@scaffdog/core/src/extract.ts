import type { ParseOptions } from '@scaffdog/engine';
import { parse } from '@scaffdog/engine';
import toString from 'mdast-util-to-string';
import markdown from 'remark-parse';
import unified from 'unified';
import visit from 'unist-util-visit-parents';
import type { Template, VariableSourceMap } from './types';

const VARIABLES_SECTION_TITLE_REGEX = /^variables/i;
const VARIABLE_REGEX = /^([_$a-z][0-9a-z_$]*)\s*:\s*(.*)\s*$/i;

const parseVariable = (input: string): [key: string, value: string] => {
  const m = VARIABLE_REGEX.exec(input);
  if (m == null) {
    return ['', ''];
  }

  return [m[1], m[2]];
};

export type ExtractOptions = Partial<ParseOptions>;

export type ExtractResult = {
  variables: VariableSourceMap;
  templates: Template[];
};

export const extract = (
  input: string,
  options: ExtractOptions,
): ExtractResult => {
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
            filename: parse(filename, options),
            content: parse(toString(node), options),
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
                variables.set(key, parse(value, options));
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
