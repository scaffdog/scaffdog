import fs from 'fs/promises';
import path from 'path';
import type { DocumentGen } from 'contentlayer/core';
import type { ComputedFields } from 'contentlayer/source-files';
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import { execaCommand } from 'execa';
import { slug } from 'github-slugger';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import type { Heading } from './types/content';

const Repository = {
  EDIT_URL: 'https://github.com/scaffdog/scaffdog/edit/canary/website/content',
};

const getLastEditedDate = async (doc: DocumentGen): Promise<Date> => {
  const filepath = path.join('content', doc._raw.sourceFilePath);

  try {
    const result = await execaCommand(
      `git log --format=%ct --max-count=1 -- ${path.basename(filepath)}`,
      {
        cwd: path.dirname(filepath),
      },
    );
    if (result.exitCode !== 0) {
      throw new Error(result.stderr);
    }
    const output = result.stdout.trim();
    if (output === '') {
      throw new Error(
        `failed to retrieve the git history for file "${filepath}".`,
      );
    }
    const match = output.match(/^(\d+)$/);
    if (match == null) {
      throw new Error(
        `failed to retrieve the git history for file "${filepath}" with unexpected output: "${output}"`,
      );
    }
    return new Date(Number(match[1]) * 1000);
  } catch (e) {}

  const stats = await fs.stat(filepath);
  return stats.mtime;
};

const extractToc = (content: string): Heading[] => {
  return [...content.matchAll(/^(### |## )(.*)\n/gm)].map((heading) => {
    const level = heading[1].trim() === '##' ? 2 : 3;
    const text = heading[2].trim();
    const id = slug(text, false);

    return {
      id,
      level,
      text,
    };
  });
};

const computedFields: ComputedFields = {
  slug: {
    type: 'string',
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
};

const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: 'docs/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string' },
    description: { type: 'string' },
    id: { type: 'string' },
    lastEdited: { type: 'date' },
  },
  computedFields: {
    ...computedFields,
    frontmatter: {
      type: 'json',
      resolve: async (doc) => ({
        title: doc.title,
        description: doc.description,
        slug: `/${doc._raw.flattenedPath}`,
        editUrl: `${Repository.EDIT_URL}/${doc._id}`,
        lastEdited: await getLastEditedDate(doc),
        headings: extractToc(doc.body.raw),
      }),
    },
  },
}));

const contentLayerConfig = makeSource({
  disableImportAliasWarning: true,
  contentDirPath: 'content',
  documentTypes: [Doc],
  mdx: {
    remarkPlugins: [remarkSlug, remarkGfm, remarkEmoji as any],
  },
});

export default contentLayerConfig;
