import type { SourceRange } from '@scaffdog/types';

export type ParseErrorEntry = {
  message: string;
  range: SourceRange;
};

export const parseError = (
  message: string,
  range: SourceRange,
): ParseErrorEntry => ({
  message,
  range,
});

export class ParseErrorStack {
  public static from(errors: ParseErrorEntry[]): ParseErrorStack {
    return new ParseErrorStack(errors);
  }

  private constructor(private errors: ParseErrorEntry[]) {}

  public all(): ParseErrorEntry[] {
    return this.errors;
  }

  public clear(): ParseErrorStack {
    const stack = ParseErrorStack.from([]);
    return stack;
  }

  public latest(): ParseErrorEntry | null {
    return this.errors[this.errors.length - 1] ?? null;
  }

  public upsert(
    from: ParseErrorEntry | null,
    to: ParseErrorEntry,
  ): ParseErrorStack {
    if (from == null) {
      return ParseErrorStack.from([...this.errors, to]);
    }

    const index = this.errors.findIndex((entry) => entry === from);
    if (index < 0) {
      return ParseErrorStack.from([...this.errors, to]);
    }

    return ParseErrorStack.from([
      ...this.errors.slice(0, index),
      to,
      ...this.errors.slice(index + 1),
    ]);
  }

  public append(entry: ParseErrorEntry): ParseErrorStack {
    const stack = ParseErrorStack.from([...this.errors, entry]);
    return stack;
  }

  public [Symbol.iterator]() {
    let index = -1;
    return {
      next: () => ({
        value: this.errors[++index],
        done: index === this.errors.length,
      }),
    };
  }
}
