import type { Program } from '@scaffdog/engine';

export type VariableSourceMap = Map<string, Program>;

export type Template = {
  filename: Program;
  content: Program;
};
