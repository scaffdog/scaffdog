import type { HelperMap } from './helper.js';
import type { TagPair } from './tag.js';
import type { VariableMap } from './variable.js';

export type Context = {
  cwd: string;
  variables: VariableMap;
  helpers: HelperMap;
  tags: TagPair;
};
