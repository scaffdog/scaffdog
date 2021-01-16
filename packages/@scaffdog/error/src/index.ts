import type { SourceLocation } from '@scaffdog/types';
import chalk from 'chalk';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

export type ScaffdogErrorOptions = {
  source: string | null;
  loc: SourceLocation | null;
};

export type ScaffdogErrorFormatOptions = {
  color: boolean;
};

export class ScaffdogError extends Error {
  private _options: ScaffdogErrorOptions;

  public constructor(
    message: string,
    options: Partial<ScaffdogErrorOptions> = {},
  ) {
    super(message);

    this._options = {
      source: null,
      loc: null,
      ...options,
    };

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public format(options: Partial<ScaffdogErrorFormatOptions> = {}): string {
    const { source, loc } = this._options;
    if (!source || !loc) {
      return this.message;
    }

    const chk = new chalk.Instance({
      level: options.color ? 1 : 0,
    });

    const red = chk.red;
    const space = (count: number) => ' '.repeat(Math.max(0, count));
    const mark = (count: number) => red('^'.repeat(Math.max(0, count)));
    const emphasis = (line: string, s: number, e: number) =>
      line.substring(0, s - 1) +
      red(line.substring(s - 1, e)) +
      line.substring(e);

    const base = Math.max(loc.start.line - 3, 0);
    const lines = source.split(NEWLINE);

    lines.splice(0, base);
    lines.splice(loc.end.line - loc.start.line + 5);

    const start = {
      line: loc.start.line - 1 - base,
      column: loc.start.column,
    };

    const end = {
      line: loc.end.line - 1 - base,
      column: loc.end.column,
    };

    const output = [`   ${red(`${this.message}:`)}`, ''];
    const gutter = chk.gray('│');

    lines.forEach((line, index) => {
      if (start.line <= index && index <= end.line) {
        const isFirstLine = start.line === index;
        const isLastLine = end.line === index;
        const col = {
          start: isFirstLine ? start.column : 1,
          end: isLastLine ? end.column : line.length,
        };

        output.push(
          ` ${red('>')} ${gutter} ` + emphasis(line, col.start, col.end),
          `   ${gutter} ` +
            space(col.start - 1) +
            mark(col.end - col.start + 1),
        );
      } else {
        output.push(`   ${gutter} ${line}`);
      }
    });

    return output.join('\n');
  }
}

export const error = (
  message: string,
  options: Partial<ScaffdogErrorOptions> = {},
): ScaffdogError => new ScaffdogError(message, options);
