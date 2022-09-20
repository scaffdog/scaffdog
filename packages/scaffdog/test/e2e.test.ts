import fs from 'fs';
import path from 'path';
import globby from 'globby';
import strip from 'strip-ansi';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { $ } from 'zx';
import pkg from '../package.json';

$.verbose = false;

const paths = {
  bin: pkg.bin.scaffdog,
};

const clear = () => {
  try {
    fs.rmSync(path.resolve(process.cwd(), 'tmp'), {
      recursive: true,
    });
  } catch (e) {}
};

describe('generate', () => {
  beforeAll(() => {
    clear();
  });

  afterEach(() => {
    clear();
  });

  test.each([
    ['basic', '.', []],
    ['basic', 'override', []],
    ['inputs', '.', ['value:scaffdog', 'choice:B']],
    ['inputs', 'deep/nest', ['value:e2e', 'choice:C']],
    [
      'question',
      'dist',
      [
        'shorthand:input_shorthand',
        'input:input_basic',
        'input_with_initial:input_initial',
        'input_if:input_true',
        'bool:true',
        'bool_with_true:false',
        'bool_with_false:true',
        'bool_if:true',
        'list:A',
        'list_with_initial:B',
        'list_if:C',
        'checkbox:A',
        'checkbox_with_initial:B',
        'checkbox_if:C',
      ],
    ],
    ['vars', '.', ['foo:bar-baz']],
    ['conditional-generate', 'true', ['bool:true']],
    ['conditional-generate', 'false', ['bool:false']],
  ])('%s - %s', async (name, output, answers) => {
    const flags = [
      name,
      '-p',
      'fixtures',
      '-o',
      output,
      ...answers.flatMap((v) => ['-a', v]),
    ];

    const p = await $`node ${paths.bin} generate ${flags}`;
    const out = strip(p.toString());

    const files = await globby('tmp/**/*', {
      onlyFiles: true,
    });

    const results = files.reduce<
      {
        path: string;
        content: string;
      }[]
    >((acc, cur) => {
      acc.push({
        path: cur,
        content: fs.readFileSync(cur, 'utf8'),
      });
      return acc;
    }, []);

    expect(out).toMatchSnapshot();
    expect(results).toMatchSnapshot();
  });
});
