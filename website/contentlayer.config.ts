import path from 'path';
import fs from 'fs/promises';
import type { ComputedFields } from 'contentlayer/source-files';
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import slugger from 'github-slugger';
import type { DocumentGen } from 'contentlayer/core';
import type { Heading } from './types/content';

const Repository = {
  EDIT_URL: 'https://github.com/scaffdog/scaffdog/tree/main/website',
};

const getLastEditedDate = async (doc: DocumentGen): Promise<Date> => {
  const stats = await fs.stat(path.join('content', doc._raw.sourceFilePath));
  return stats.mtime;
};

const extractToc = (content: string): Heading[] => {
  return [...content.matchAll(/^(### |## )(.*)\n/gm)].map((heading) => {
    const level = heading[1].trim() === '##' ? 2 : 3;
    const text = heading[2].trim();
    const id = slugger.slug(text, false);

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
