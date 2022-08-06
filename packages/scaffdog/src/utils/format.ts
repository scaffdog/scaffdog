import type { File } from '@scaffdog/types';
import wrap from 'wrap-ansi';
import truncate from 'cli-truncate';
import figures from 'figures';
import chalk from 'chalk';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

const chars = {
  t: '┬',
  c: '┼',
  b: '┴',
  x: '─',
  y: '│',
};

export type FormatFileOptions = {
  columns: number;
  color: boolean;
};

export const formatFile = (
  file: File,
  { columns, color }: FormatFileOptions,
): string => {
  const chk = new chalk.Instance({
    level: color ? 1 : 0,
  });

  const output: string[] = [];
  const lines = file.content.split(NEWLINE);
  const gutter = Math.max(`${lines.length}`.length + 2, 3);

  // filename
  const body = chars.x.repeat(columns - gutter - 1);
  const filename = file.skip ? `(skip) ${file.filename}` : file.filename;

  output.push(
    chk.gray([chars.x.repeat(gutter), chars.t, body].join('')),
    [
      ' '.repeat(gutter - 2),
      chk.green(figures.tick),
      ' ',
      chk.gray(chars.y),
      chk` File: {bold ${truncate(filename, columns - gutter - 8)}}`,
    ].join(''),
    chk.gray([chars.x.repeat(gutter), chars.c, body].join('')),
  );

  // content
  let n = 1;
  lines.forEach((line) => {
    wrap(line, columns - gutter - 2, {
      trim: false,
      hard: true,
      wordWrap: false,
    })
      .split(NEWLINE)
      .forEach((l, i) => {
        const ns = `${n}`;
        const prefix = chk.gray((i === 0 ? ns : ' ').padStart(gutter - 2));
        const lc = lines.length === 1 && line == '' ? '(empty)' : l;

        output.push(chk` ${prefix} {gray ${chars.y}} ${lc}`);
      });
    n++;
  });

  return output.join('\n');
};
