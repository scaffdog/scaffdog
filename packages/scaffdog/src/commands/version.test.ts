import { expect, test } from 'vitest';
import { createCommandRunner } from '../mocks/command-test-utils.js';
import cmd from './version.js';

const run = createCommandRunner(cmd, {
  args: {},
  flags: {},
});

test('version', async () => {
  const { code, stdout } = await run({});

  expect(code).toBe(0);

  expect(stdout).toBe('v1.0.0\n');
});
