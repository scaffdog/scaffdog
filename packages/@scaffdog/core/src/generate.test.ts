import path from 'path';
import { expect, test } from 'vitest';
import { generate } from './generate';

const cwd = process.cwd();
const root = path.join(cwd, 'path', 'to');

test('basic', () => {
  const opts = {
    cwd,
    root,
  };

  expect(
    generate(
      [
        {
          filename: 'plain.txt',
          content: `
inputs.name: {{ inputs.name }}
cwd: {{ cwd }}
output.root: {{ output.root }}
output.path: {{ output.path }}
output.abs: {{ output.abs }}
output.name: {{ output.name }}
output.base: {{ output.base }}
output.ext: {{ output.ext }}
output.dir: {{ output.dir }}
`.trim(),
        },
        {
          filename: '{{ inputs.name }}.js',
          content: `
{{ output.path }}
`.trim(),
        },
      ],
      new Map([['inputs', { name: 'value' }]]),
      opts,
    ),
  ).toEqual([
    {
      output: path.resolve(root, 'plain.txt'),
      filename: 'plain.txt',
      content: `
inputs.name: value
cwd: ${cwd}
output.root: path/to
output.path: path/to/plain.txt
output.abs: ${path.join(cwd, 'path/to/plain.txt')}
output.name: plain
output.base: plain.txt
output.ext: .txt
output.dir: path/to
`.trim(),
    },
    {
      output: path.resolve(root, 'value.js'),
      filename: 'value.js',
      content: 'path/to/value.js',
    },
  ]);
});

test('custom', () => {
  const opts = {
    cwd,
    root,
    tags: ['<%=', '=%>'] as const,
  };

  expect(
    generate(
      [
        {
          filename: 'plain.txt',
          content: `cwd: <%= cwd =%>`,
        },
      ],
      new Map(),
      opts,
    ),
  ).toEqual([
    {
      output: path.resolve(opts.root, 'plain.txt'),
      filename: 'plain.txt',
      content: `cwd: ${cwd}`,
    },
  ]);
});
