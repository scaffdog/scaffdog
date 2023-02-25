import type {
  SourceLocation,
  SourcePosition,
  SourceRange,
} from '@scaffdog/types';
import chalk from 'chalk';
import stringLength from 'string-length';
import { ExtensibleError } from './utils';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

const calculatePosition = (
  source: string[],
  position: SourcePosition = {
    line: 1,
    column: 1,
  },
): SourcePosition => {
  const pos = { ...position };
  const buffer: string[] = [];

  for (const s of source) {
    if (s === '\n') {
      pos.line++;
      pos.column = 1;
      buffer.length = 0;
    } else {
      buffer.push(s);
    }
  }

  pos.column += stringLength(buffer.join(''));

  return pos;
};

const range2location = (
  source: string[],
  range: SourceRange,
): SourceLocation => {
  const start = calculatePosition(source.slice(0, range[0]));
  const end = calculatePosition(source.slice(range[0], range[1]), start);

  return {
    start,
    end,
  };
};

const extractLines = (
  source: string[],
  start: number,
  end: number,
): string[] => {
  const lines: string[] = [];
  const buffer: string[] = [];
  const terminator: string[] = [];
  let line = 1;

  for (const s of source) {
    if (NEWLINE.test(s)) {
      terminator.push(s);
      continue;
    }

    if (terminator.length > 0) {
      if (line >= start) {
        lines.push(buffer.join(''));
      }
      buffer.length = 0;
      terminator.length = 0;
      line++;
    }

    buffer.push(s);

    if (line >= end) {
      break;
    }
  }

  if (buffer.length > 0) {
    lines.push(buffer.join(''));
  }

  return lines;
};

const splitColumns = (
  line: string[],
  start: number,
  end: number,
): [string, string, string] => {
  const index = {
    start: 0,
    end: 0,
  };

  let col = 1;
  let buffer = '';

  for (let i = 0; i < line.length; i++) {
    const s = line[i];
    if (stringLength(buffer + s) > 1) {
      col++;
      buffer = '';
    }
    buffer += s;
    if (col === start) {
      index.start = i;
    }
    if (col === end) {
      index.end = i;
    }
  }

  return [
    line.slice(0, index.start).join(''),
    line.slice(index.start, index.end + 1).join(''),
    line.slice(index.end + 1).join(''),
  ];
};

export type ScaffdogErrorOptions = {
  source: string | null;
  range: SourceRange | null;
};

export type ScaffdogErrorFormatOptions = {
  color: boolean;
};

export class ScaffdogError extends ExtensibleError {
  private _options: ScaffdogErrorOptions;

  public constructor(
    message: string,
    options: Partial<ScaffdogErrorOptions> = {},
  ) {
    super('ScaffdogError', message);

    this._options = {
      source: null,
      range: null,
      ...options,
    };
  }

  public format(options: Partial<ScaffdogErrorFormatOptions> = {}): string {
    const { source, range } = this._options;
    if (source == null || range == null) {
      return this.message;
    }

    const chk = new chalk.Instance({
      level: options.color ? 1 : 0,
    });

    const red = chk.red;
    const space = (count: number) => ' '.repeat(Math.max(0, count));
    const mark = (count: number) => red('^'.repeat(Math.max(0, count)));
    const emphasis = (line: string, start: number, end: number) => {
      const [header, body, footer] = splitColumns([...line], start, end);
      return [header, red(body), footer].join('');
    };

    const src = [...source];
    const loc = range2location(src, range);
    const offset = 2;

    const slice = {
      start: Math.max(loc.start.line - offset, 1),
      end: loc.end.line + offset,
    };

    const lines = extractLines(src, slice.start, slice.end);
    const output = [`   ${red(`${this.message}:`)}`, ''];
    const gutter = chk.gray('│');

    lines.forEach((line, index) => {
      const ln = slice.start + index;

      if (loc.start.line <= ln && ln <= loc.end.line) {
        const isFirstLine = loc.start.line === ln;
        const isLastLine = loc.end.line === ln;
        const col = {
          start: isFirstLine ? loc.start.column : 1,
          end: isLastLine ? loc.end.column : stringLength(line),
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
