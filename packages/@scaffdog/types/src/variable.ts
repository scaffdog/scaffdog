export type Variable =
  | string
  | { [key in string | number]: Variable }
  | Variable[];

export type VariableMap = Map<string, Variable>;

export type VariableRecord = Record<string, Variable>;
