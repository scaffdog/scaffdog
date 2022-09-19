import merge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import type { PartialDeep } from 'type-fest';
import type { Document } from './document';

export const createDocument = (props: PartialDeep<Document> = {}): Document =>
  merge(
    {
      name: '',
      root: '',
      output: '',
      ignore: [],
      questions: {},
      path: '',
      templates: [],
      variables: new Map(),
    },
    props as any,
    {
      isMergeableObject: isPlainObject,
    },
  );
