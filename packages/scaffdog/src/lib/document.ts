import path from 'path';
import type {
  ExtractOptions,
  Template,
  VariableSourceMap,
} from '@scaffdog/core';
import { extract } from '@scaffdog/core';
import { ScaffdogError } from '@scaffdog/error';
import frontmatter from 'front-matter';
import * as z from 'zod';
import type { FsLibrary } from './fs';
import { questionRecordSchema } from './question';

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

export type DocumentAttributes = z.infer<typeof attrSchema>;
const attrSchema = z.object({
  name: z.string(),
  root: z.string(),
  output: z.union([z.string(), z.array(z.string())]),
  ignore: z.array(z.string()).optional(),
  questions: questionRecordSchema.optional(),
});

export type Document = DocumentAttributes & {
  path: string;
  templates: Template[];
  variables: VariableSourceMap;
};

/**
 * @internal
 */
export const parse = (
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

/**
 * @public
 */
export type DocumentLibrary = {
  resolve: (
    dirname: string,
    patterns: string[],
    options: ExtractOptions,
  ) => Promise<Document[]>;
};

export const createDocumentLibrary = (fs: FsLibrary): DocumentLibrary => ({
  resolve: async (dirname, patterns, options) => {
    const paths = await fs.glob(patterns, {
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
          const content = await fs.readFile(filepath);
          return parse(filepath, content, options);
        }),
    );
  },
});

createDocumentLibrary.inject = ['fs'] as const;
