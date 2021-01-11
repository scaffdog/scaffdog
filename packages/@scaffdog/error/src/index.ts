import chalk from 'chalk';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

export type ErrorLoc = {
  line: number;
  column: number;
};

export type ScaffdogErrorOptions = {
  source: string;
  start: ErrorLoc;
  end: ErrorLoc;
  color: boolean;
};

export class ScaffdogError extends Error {
  public constructor(
    message: string,
    options: Partial<ScaffdogErrorOptions> = {},
  ) {
    super(message);

    const opts = {
      color: true,
      ...options,
    };

    if (opts.source && opts.start && opts.end) {
      this.message = this._format(message, {
        source: opts.source,
        start: opts.start,
        end: opts.end,
        color: !!opts.color,
      });
    }

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

  private _format(message: string, options: ScaffdogErrorOptions) {
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

    const base = Math.max(options.start.line - 3, 0);
    const lines = options.source.split(NEWLINE);

    lines.splice(0, base);
    lines.splice(options.end.line - options.start.line + 5);

    const start = {
      line: options.start.line - 1 - base,
      column: options.start.column,
    };

    const end = {
      line: options.end.line - 1 - base,
      column: options.end.column,
    };

    const output: string[] = [];

    lines.forEach((line, index) => {
      if (start.line <= index && index <= end.line) {
        const isFirstLine = start.line === index;
        const isLastLine = end.line === index;
        const col = {
          start: isFirstLine ? start.column : 1,
          end: isLastLine ? end.column : line.length,
        };

        output.push(
          emphasis(line, col.start, col.end),
          space(col.start - 1) + mark(col.end - col.start + 1),
        );
      } else {
        output.push(line);
      }
    });

    return [`${red(message)}:`, output.join('\n')].join('\n\n');
  }
}

export const error = (
  message: string,
  options: Partial<ScaffdogErrorOptions>,
): ScaffdogError => new ScaffdogError(message, options);
