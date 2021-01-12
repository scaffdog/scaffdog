import path from 'path';
import type { Template } from '@scaffdog/types';
import type { VariableSourceMap } from '@scaffdog/core';
import { extract } from '@scaffdog/core';
import globby from 'globby';
import fm from 'front-matter';
import * as z from 'zod';
import { readFile } from './utils/fs';

const MARKDOWN_EXTNAME = new Set([
  '.markdown',
  '.md',
  '.mdown',
  '.mdtext',
  '.mdtxt',
  '.mdwn',
  '.mkd',
  '.mkdn',
]);

const questionSchema = z.union([
  z.string(),
  z.object({
    message: z.string(),
    initial: z.string().optional(),
    choices: z.array(z.string()).optional(),
  }),
]);

const attrSchema = z.object({
  name: z.string(),
  root: z.string(),
  output: z.union([z.string(), z.array(z.string())]),
  ignore: z.array(z.string()).optional(),
  questions: z.record(questionSchema).optional(),
});

export type Question = z.infer<typeof questionSchema>;
export type DocumentAttributes = z.infer<typeof attrSchema>;

export type Document = DocumentAttributes & {
  path: string;
  templates: Template[];
  variables: VariableSourceMap;
};

export const parseDocument = (path: string, input: string): Document => {
  const { attributes, body } = fm<DocumentAttributes>(input);
  const attrs = attrSchema.parse(attributes);
  const { variables, templates } = extract(body);

  return {
    ...attrs,
    path,
    variables,
    templates,
  };
};

export const resolveDocuments = async (
  dirname: string,
  patterns: string[],
): Promise<Document[]> => {
  const paths = await globby(patterns, {
    cwd: dirname,
    onlyFiles: true,
    unique: true,
    dot: true,
    absolute: true,
  });

  return await Promise.all(
    paths
      .filter((filepath) => MARKDOWN_EXTNAME.has(path.extname(filepath)))
      .map(async (filepath) => {
        return parseDocument(filepath, await readFile(filepath, 'utf8'));
      }),
  );
};
