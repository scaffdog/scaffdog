import path from 'path';
import type {
  ExtractOptions,
  Template,
  VariableSourceMap,
} from '@scaffdog/core';
import { extract } from '@scaffdog/core';
import { ScaffdogError } from '@scaffdog/error';
import frontmatter from 'front-matter';
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

const questionIfSchema = z.union([z.boolean(), z.string()]);

const questionSchema = z.union([
  // input syntax sugar
  z.string(),
  // checkbox
  z
    .object({
      message: z.string(),
      choices: z.array(z.string()),
      multiple: z.boolean().optional(),
      initial: z.array(z.string()).optional(),
      if: questionIfSchema.optional(),
    })
    .strict(),
  // list
  z
    .object({
      message: z.string(),
      choices: z.array(z.string()),
      multiple: z.boolean().optional(),
      initial: z.string().optional(),
      if: questionIfSchema.optional(),
    })
    .strict(),
  // confirm
  z
    .object({
      confirm: z.string(),
      initial: z.boolean().optional(),
      if: questionIfSchema.optional(),
    })
    .strict(),
  // input
  z
    .object({
      message: z.string(),
      initial: z.string().optional(),
      if: questionIfSchema.optional(),
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

export const parseDocument = (
  path: string,
  input: string,
  options: ExtractOptions,
): Document => {
  const { attributes, body } = frontmatter<DocumentAttributes>(input);
  const attrs = attrSchema.safeParse(attributes);
  if (!attrs.success) {
    const [issue] = attrs.error.issues;
    const paths = issue.path.join('.');
    const msg = `Document Parsing Error: in '${paths}': ${issue.message}`;
    throw new ScaffdogError(msg, {
      source: input,
    });
  }

  const { variables, templates } = extract(body, options);

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
  options: ExtractOptions,
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
        return parseDocument(filepath, content, options);
      }),
  );
};
