import { funcs, TemplateFunction } from './funcs';
import { Document } from './reader';

export type Context = {
  document: Document;
  vars: Map<string, string>;
  funcs: Map<string, TemplateFunction>;
};

export const createContext = (document: Document, vars: Map<string, string>): Context => ({
  document,
  vars,
  funcs,
});
