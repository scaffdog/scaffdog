import { expect, test } from 'vitest';
import { createCommand } from '../command';
import { createCommandContainer } from '../command-container';
import { runCommand } from '../mocks/command-test-utils';
import { createLibraryMock } from '../mocks/lib';
import cmd from './help';

const defaults = {
  args: {
    command: [],
  },
  flags: {},
};

test('command', async () => {
  const foo = createCommand({
    name: 'foo',
    summary: 'foo summary.',
    args: {
      name: {
        type: 'string',
        description: 'foo.name.description.',
      },
    },
    flags: {
      key1: {
        type: 'string',
        description: 'key1.description.',
      },
      key2: {
        type: 'boolean',
        description: 'key2.description.',
      },
      key3: {
        type: 'number',
        description: 'key3.description.',
        alias: 'k',
      },
    },
  })(async () => 0);

  const container = createCommandContainer([foo]);

  const { code, stdout } = await runCommand(
    cmd,
    {
      ...defaults.args,
      command: ['foo'],
    },
    {
      ...defaults.flags,
    },
    createLibraryMock(),
    container,
  );

  expect(code).toBe(0);

  expect(stdout).toMatchSnapshot();
});

test('global', async () => {
  const { code, stdout } = await runCommand(
    cmd,
    defaults.args,
    defaults.flags,
    createLibraryMock(),
    createCommandContainer([]),
  );

  expect(code).toBe(0);

  expect(stdout).toMatchSnapshot();
});
