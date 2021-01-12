export type SourcePosition = {
  line: number;
  column: number;
};

export type SourceLocation = {
  start: SourcePosition;
  end: SourcePosition;
};
