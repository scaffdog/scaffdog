import path from 'path';
import { test, expect } from 'vitest';
import prettier from 'prettier';

const format = (
  code: string,
  {
    project: scaffdogProject,
    ...options
  }: {
    project?: string;
  } & prettier.Options,
) => {
  const opts = {
    ...options,
    scaffdogProject,
    parser: 'markdown',
    plugins: ['.'],
    filepath: path.resolve(
      __dirname,
      '../fixtures',
      options.filepath as string,
    ),
  };

  return prettier.format(code, opts).trim();
};

test('format', () => {
  const input = '{{ident  }}';
  const output = '{{ ident }}';

  expect(
    format(input, {
      filepath: '.scaffdog/template.md',
    }),
  ).toBe(output);
});

test('without target file', () => {
  const input = '{{ident  }}';
  const output = input;

  expect(
    format(input, {
      filepath: 'README.md',
    }),
  ).toBe(output);
});

test('custom project', () => {
  const input = '{{ident  }}';
  const output = '{{ ident }}';

  expect(
    format(input, {
      project: '.templates',
      filepath: '.templates/template.md',
    }),
  ).toBe(output);
});
