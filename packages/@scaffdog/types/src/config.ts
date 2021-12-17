import type { Merge } from 'type-fest';
import type { HelperMap, HelperRecord, HelperRegister } from './helper';
import type { TagPair } from './tag';
import type { VariableMap, VariableRecord } from './variable';

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
