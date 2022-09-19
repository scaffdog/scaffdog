import strip from 'strip-ansi';
import { describe, expect, test } from 'vitest';
import { $ } from 'zx';
import pkg from '../package.json';

$.verbose = false;

const bin = pkg.bin.scaffdog;

describe('generate', () => {
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
    ['vars', '.', ['foo:scaff-dog']],
    ['conditional-generate', 'true', ['bool:true']],
    ['conditional-generate', 'false', ['bool:false']],
  ])('%s - %s', async (name, output, answers) => {
    const flags = [
      name,
      '-n',
      '-p',
      'fixtures',
      '-o',
      output,
      ...answers.flatMap((v) => ['-a', v]),
    ];

    const p = await $`node ${bin} generate ${flags}`;
    const out = strip(p.toString());

    expect(out).toMatchSnapshot();
  });
});
