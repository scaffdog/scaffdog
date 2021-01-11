import type { HelperMap } from './helper';
import type { VariableMap } from './variable';

export type Context = {
  cwd: string;
  variables: VariableMap;
  helpers: HelperMap;
};
