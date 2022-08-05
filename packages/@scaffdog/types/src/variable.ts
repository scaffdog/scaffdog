export type Variable =
  | undefined
  | null
  | string
  | number
  | boolean
  | { [key in string]: Variable }
  | Variable[];

export type VariableMap = Map<string, Variable>;

export type VariableRecord = Record<string, Variable>;
