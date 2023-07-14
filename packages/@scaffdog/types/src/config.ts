import type { Merge } from 'type-fest';
import type { HelperMap, HelperRecord, HelperRegister } from './helper.js';
import type { TagPair } from './tag.js';
import type { VariableMap, VariableRecord } from './variable.js';

export type Config = {
  files: string[];
  variables?: VariableRecord;
  helpers?: (HelperRecord | HelperRegister)[];
  tags?: TagPair;
};

export type ResolvedConfig = Merge<
  Config,
  {
    variables: VariableMap;
    helpers: HelperMap;
  }
>;
