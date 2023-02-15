import merge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import type { PartialDeep } from 'type-fest';
import type { File } from './file';

export const createFile = (props: PartialDeep<File> = {}): File =>
  merge(
    {
      skip: false,
      path: '',
      name: '',
      content: '',
    },
    props as any,
    {
      isMergeableObject: isPlainObject,
    },
  );
