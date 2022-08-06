import path from 'path';
import type { VariableSourceMap } from '@scaffdog/core';
import { extract } from '@scaffdog/core';
import { ScaffdogError } from '@scaffdog/error';
import type { Template } from '@scaffdog/types';
import fm from 'front-matter';
import globby from 'globby';
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
  // input syntax sugar
  z.string(),
  // list, checkbox
  z
    .object({
      message: z.string(),
      choices: z.array(z.string()),
      multiple: z.boolean().optional(),
      initial: z.array(z.string()).optional(),
    })
    .strict(),
  // confirm
  z
    .object({
      confirm: z.string(),
      initial: z.boolean().optional(),
    })
    .strict(),
  // input
  z
    .object({
      message: z.string(),
      initial: z.string().optional(),
    })
    .strict(),
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
  const attrs = attrSchema.safeParse(attributes);
  if (!attrs.success) {
    const [issue] = attrs.error.issues;
    const paths = issue.path.join('.');
    const msg = `Document Parsing Error: in '${paths}': ${issue.message}`;
    throw new ScaffdogError(msg, {
      source: input,
    });
  }

  const { variables, templates } = extract(body);

  return {
    ...attrs.data,
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
        const content = await readFile(filepath, 'utf8');
        return parseDocument(filepath, content);
      }),
  );
};
