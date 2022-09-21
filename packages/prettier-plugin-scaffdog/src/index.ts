import path from 'path';
import { loadConfig } from '@scaffdog/config';
import { format, parse } from '@scaffdog/engine';
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
  const { config } = loadConfig(dir, { project: name });

  configCache.set(project, config);

  return config;
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

      return format(parse(text, { tags: config.tags }));
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
