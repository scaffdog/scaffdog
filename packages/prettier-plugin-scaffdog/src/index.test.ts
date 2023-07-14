import path from 'path';
import { test, expect } from 'vitest';
import prettier from 'prettier';

const format = async (
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
    plugins: ['./dist/index.mjs'],
    filepath: path.resolve(
      __dirname,
      '../fixtures',
      options.filepath as string,
    ),
  };

  return (await prettier.format(code, opts)).trim();
};

test('format', async () => {
  const input = '{{ident  }}';
  const output = '{{ ident }}';

  expect(
    await format(input, {
      filepath: '.scaffdog/template.md',
    }),
  ).toBe(output);
});

test('without target file', async () => {
  const input = '{{ident  }}';
  const output = input;

  expect(
    await format(input, {
      filepath: 'README.md',
    }),
  ).toBe(output);
});

test('custom project', async () => {
  const input = '{{ident  }}';
  const output = '{{ ident }}';

  expect(
    await format(input, {
      project: '.templates',
      filepath: '.templates/template.md',
    }),
  ).toBe(output);
});
