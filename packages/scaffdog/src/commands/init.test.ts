import path from 'path';
import type { Mock } from 'vitest';
import { describe, expect, test, vi } from 'vitest';
import { createFsLibraryMock } from '../lib/fs.mock';
import { createPromptLibraryMock } from '../lib/prompt.mock';
import { createCommandRunner, cwd } from '../mocks/command-test-utils.js';
import { createLibraryMock } from '../mocks/lib.js';
import cmd from './init.js';

const run = createCommandRunner(cmd, {
  args: {},
  flags: {},
});

describe('success', () => {
  test('fresh', async () => {
    const lib = createLibraryMock({
      fs: createFsLibraryMock({
        directoryExists: vi.fn().mockReturnValue(false),
        mkdir: vi.fn().mockReturnValueOnce(Promise.resolve()),
        writeFile: vi.fn().mockReturnValue(Promise.resolve()),
      }),
      prompt: createPromptLibraryMock({
        prompt: vi.fn().mockResolvedValueOnce('pretty-dog'),
      }),
    });

    const { code, stdout, stderr } = await run({
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.fs.directoryExists).toBeCalledWith(
      path.resolve(cwd, '.scaffdog'),
    );

    expect(lib.fs.mkdir).toBeCalledWith(path.resolve(cwd, '.scaffdog'), {
      recursive: true,
    });

    const writeFile = lib.fs.writeFile as Mock;
    expect(writeFile.mock.calls.length).toBe(2);
    expect(path.relative(cwd, writeFile.mock.calls[0][0])).toBe(
      '.scaffdog/config.js',
    );
    expect(path.relative(cwd, writeFile.mock.calls[0][1])).toMatchSnapshot();
    expect(path.relative(cwd, writeFile.mock.calls[1][0])).toBe(
      '.scaffdog/pretty-dog.md',
    );
    expect(path.relative(cwd, writeFile.mock.calls[1][1])).toMatchSnapshot();
  });

  test('.scaffdog already exist', async () => {
    const lib = createLibraryMock({
      fs: createFsLibraryMock({
        directoryExists: vi.fn().mockReturnValue(true),
        mkdir: vi.fn().mockReturnValueOnce(Promise.resolve()),
        writeFile: vi.fn().mockReturnValue(Promise.resolve()),
      }),
      prompt: createPromptLibraryMock({
        prompt: vi.fn().mockResolvedValueOnce('pretty-dog'),
        confirm: vi.fn().mockResolvedValueOnce(true),
      }),
    });

    const { code, stdout, stderr } = await run({
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
  });
});

describe('failure', () => {
  test('cancel', async () => {
    const lib = createLibraryMock({
      fs: createFsLibraryMock({
        directoryExists: vi.fn().mockReturnValue(true),
      }),
      prompt: createPromptLibraryMock({
        confirm: vi.fn().mockResolvedValueOnce(false),
      }),
    });

    const { code, stdout, stderr } = await run({
      lib,
    });

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });
});
