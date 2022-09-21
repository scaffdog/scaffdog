import merge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import type { ResolvedConfig } from '@scaffdog/types';
import type { PartialDeep } from 'type-fest';

export const createResolvedConfig = (
  props: PartialDeep<ResolvedConfig> = {},
): ResolvedConfig =>
  merge(
    {
      files: [],
      variables: new Map(),
      helpers: new Map(),
    },
    props as any,
    {
      isMergeableObject: isPlainObject,
    },
  );
