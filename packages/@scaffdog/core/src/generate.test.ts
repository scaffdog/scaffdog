import path from 'path';
import test from 'ava';
import { generate } from './generate';

const cwd = process.cwd();

test('basic', (t) => {
  const opts = {
    cwd,
    root: path.join(cwd, 'path', 'to'),
  };

  t.deepEqual(
    generate(
      [
        {
          filename: 'plain.txt',
          content: `
inputs.name: {{ inputs.name }}
cwd: {{ cwd }}
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
    [
      {
        output: path.resolve(opts.root, 'plain.txt'),
        filename: 'plain.txt',
        content: `
inputs.name: value
cwd: ${cwd}
output.path: path/to/plain.txt
output.abs: ${path.join(cwd, 'path/to/plain.txt')}
output.name: plain
output.base: plain.txt
output.ext: .txt
output.dir: path/to
`.trim(),
      },
      {
        output: path.resolve(opts.root, 'value.js'),
        filename: 'value.js',
        content: 'path/to/value.js',
      },
    ],
  );
});
