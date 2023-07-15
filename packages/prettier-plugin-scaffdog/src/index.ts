import path from 'path';
import { loadConfig } from '@scaffdog/config';
import { format, parse } from '@scaffdog/engine';
import type { ResolvedConfig } from '@scaffdog/types';
import { minimatch } from 'minimatch';
import type { Parser } from 'prettier';
import prettier from 'prettier';
import { parsers as markdownParsers } from 'prettier/plugins/markdown';

const configCache = new Map<string, ResolvedConfig>();
const resolveConfig = (project: string) => {
  if (configCache.has(project)) {
    return configCache.get(project)!;
  }

  const { config } = loadConfig(project);

  configCache.set(project, config);

  return config;
};

const resolveProject = async (project: string, filepath: string) => {
  const configpath = await prettier.resolveConfigFile(filepath);
  const dirname =
    configpath != null
      ? path.dirname(configpath)
      : process.env.VSCODE_CWD ?? process.cwd();

  return path.resolve(dirname, project);
};

const wrap = (parser: Parser): Parser => ({
  ...parser,
  parse: async (text, options) => {
    const parseMd = (s: string) => parser.parse(s, options);

    try {
      const project = await resolveProject(
        (options as any).scaffdogProject,
        options.filepath,
      );

      const config = resolveConfig(project);

      const match = config.files.some((file) =>
        minimatch(options.filepath, path.join(project, file)),
      );
      if (!match) {
        return await parseMd(text);
      }

      const txt = format(parse(text, { tags: config.tags }));

      return await parseMd(txt);
    } catch (e) {
      return await parseMd(text);
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
