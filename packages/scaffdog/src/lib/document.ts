import path from 'path';
import type {
  ExtractOptions,
  Template,
  VariableSourceMap,
} from '@scaffdog/core';
import { extract } from '@scaffdog/core';
import { ScaffdogAggregateError, ScaffdogError } from '@scaffdog/error';
import frontmatter from 'front-matter';
import * as z from 'zod';
import type { FsLibrary } from './fs';
import type { QuestionLibrary, QuestionMap } from './question';
import { rawQuestionRecordSchema } from './question';

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

export type RawDocumentAttributes = z.infer<typeof rawAttrSchema>;
const rawAttrSchema = z.object({
  name: z.string(),
  root: z.string(),
  output: z.union([z.string(), z.array(z.string())]),
  ignore: z.array(z.string()).optional(),
  questions: rawQuestionRecordSchema.optional(),
});

export type DocumentAttributes = Omit<RawDocumentAttributes, 'questions'> & {
  questions: QuestionMap;
};

export type Document = DocumentAttributes & {
  path: string;
  templates: Template[];
  variables: VariableSourceMap;
};

/**
 * @internal
 */
export const parse = (
  question: QuestionLibrary,
  path: string,
  input: string,
  options: ExtractOptions,
): Document => {
  const { attributes, body } = frontmatter<RawDocumentAttributes>(input);
  const attrs = rawAttrSchema.safeParse(attributes);
  if (!attrs.success) {
    const [issue] = attrs.error.issues;
    const paths = issue.path.join('.');
    const msg = `Document Parsing Error: in "${paths}": ${issue.message} at "${path}"`;
    throw new ScaffdogError(msg, {
      source: input,
    });
  }

  const questions = question.parse(attrs.data.questions ?? {});

  const { variables, templates } = extract(body, options);

  return {
    ...attrs.data,
    path,
    variables,
    templates,
    questions,
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

export const createDocumentLibrary = (
  fs: FsLibrary,
  question: QuestionLibrary,
): DocumentLibrary => ({
  resolve: async (dirname, patterns, options) => {
    const paths = await fs.glob(patterns, {
      cwd: dirname,
      onlyFiles: true,
      unique: true,
      dot: true,
      absolute: true,
    });

    const results = await Promise.allSettled(
      paths
        .filter((filepath) => MARKDOWN_EXTNAME.has(path.extname(filepath)))
        .map(async (filepath) => {
          const content = await fs.readFile(filepath);
          return parse(question, filepath, content, options);
        }),
    );

    const [documents, errors] = results.reduce<[Document[], any[]]>(
      (acc, cur) => {
        if (cur.status === 'fulfilled') {
          acc[0].push(cur.value);
        } else {
          acc[1].push(cur.reason);
        }
        return acc;
      },
      [[], []],
    );

    if (errors.length > 0) {
      throw new ScaffdogAggregateError(
        errors,
        `${errors.length} documents failed to load`,
      );
    }

    return documents;
  },
});
