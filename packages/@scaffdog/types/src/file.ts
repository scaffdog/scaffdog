import type { Template } from './template';

export type File = Template & {
  output: string;
};
