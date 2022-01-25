import path from 'path';
import { loadConfig } from '@scaffdog/config';
import { createContext, Formatter, Parser, tokenize } from '@scaffdog/engine';
import type { ResolvedConfig } from '@scaffdog/types';
import minimatch from 'minimatch';
import type { Parser as PrettierParser } from 'prettier';
import prettier from 'prettier';
import { parsers as markdownParsers } from 'prettier/parser-markdown';

const configCache = new Map<string, ResolvedConfig>();
const resolveConfig = (project: string) => {
  if (configCache.has(project)) {
    return configCache.get(project)!;
  }

  const { dir, name } = path.parse(project);

  return loadConfig(dir, { project: name });
};

const resolveProject = (project: string, filepath: string) => {
  const configpath = prettier.resolveConfigFile.sync(filepath);
  const dirname =
    configpath != null
      ? path.dirname(configpath)
      : process.env.VSCODE_CWD ?? process.cwd();

  return path.resolve(dirname, project);
};

const wrap = (parser: PrettierParser): PrettierParser => ({
  ...parser,
  preprocess: (text, options) => {
    text = parser?.preprocess?.(text, options) ?? text;

    try {
      const project = resolveProject(
        (options as any).scaffdogProject,
        options.filepath,
      );

      const config = resolveConfig(project);

      const match = config.files.some((file) =>
        minimatch(options.filepath, path.join(project, file)),
      );

      if (!match) {
        return text;
      }

      const context = createContext({ tags: config.tags });
      const tokens = tokenize(text, { tags: context.tags });
      const parser = new Parser(tokens, text);

      return new Formatter().format(parser.parse());
    } catch (e) {
      return text;
    }
  },
});

export const options = {
  scaffdogProject: {
    type: 'path',
    category: 'Config',
    default: '.scaffdog',
    description: 'Directory path to load the scaffdog project.',
  },
};

export const parsers = {
  remark: wrap(markdownParsers.remark),
  markdown: wrap(markdownParsers.markdown),
};
