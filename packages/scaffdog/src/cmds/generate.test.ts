import path from 'path';
import fs from 'fs';
import { test, describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { cwd, runCommand } from '../mocks/command-test-utils';
import * as prompt from '../prompt';
import cmd from './generate';

const defaults = {
  name: undefined,
  'dry-run': false,
  force: false,
};

const clear = () => {
  try {
    fs.rmSync(path.resolve(cwd, 'tmp'), {
      recursive: true,
    });
  } catch (e) {}
};

const mount = (files: Record<string, { path: string; content: string }>) => {
  for (const entry of Object.values(files)) {
    const filepath = path.resolve(cwd, entry.path);
    const dirname = path.dirname(filepath);

    fs.mkdirSync(dirname, { recursive: true });
    fs.writeFileSync(filepath, entry.content, 'utf8');
  }
};

beforeAll(() => {
  clear();
});

afterEach(() => {
  clear();
  vi.clearAllMocks();
});

describe('prompt', () => {
  test('name', async () => {
    vi.spyOn(prompt, 'prompt').mockResolvedValueOnce('a'); // name

    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
    });

    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
    expect(code).toBe(0);
    expect(
      fs.readFileSync(path.resolve(cwd, 'tmp/nest/dump.txt'), 'utf8'),
    ).toMatchSnapshot();
  });

  test('overwrite files', async () => {
    vi.spyOn(prompt, 'confirm')
      .mockResolvedValueOnce(true) // dump.txt
      .mockResolvedValueOnce(false); // generate.txt (skipped)

    const file = {
      dump: {
        path: path.resolve(cwd, 'tmp/nest/dump.txt'),
        content: 'dump',
      },
      generate: {
        path: path.resolve(cwd, 'tmp/generate.txt'),
        content: 'generate',
      },
    };

    mount(file);

    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'a',
    });

    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
    expect(code).toBe(0);

    expect(fs.readFileSync(file.dump.path, 'utf8')).not.toBe(file.dump.content);
    expect(fs.readFileSync(file.generate.path, 'utf8')).toBe(
      file.generate.content,
    );
  });

  test('has magic and question', async () => {
    fs.mkdirSync(path.resolve(cwd, 'tmp/root'), { recursive: true });

    vi.spyOn(prompt, 'autocomplete').mockResolvedValueOnce('root');
    vi.spyOn(prompt, 'prompt')
      .mockResolvedValueOnce('value')
      .mockResolvedValueOnce('B');

    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'b',
    });

    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('all question types', async () => {
    vi.spyOn(prompt, 'prompt')
      .mockResolvedValueOnce('shorthand') // shorthand
      .mockResolvedValueOnce('input') // input
      .mockResolvedValueOnce('input_with_initial') // input_with_initial
      .mockResolvedValueOnce('input_if') // input_if
      .mockResolvedValueOnce(true) // bool
      .mockResolvedValueOnce(true) // bool_with_true
      .mockResolvedValueOnce(false) // bool_with_false
      .mockResolvedValueOnce(true) // bool_if
      .mockResolvedValueOnce('C') // list
      .mockResolvedValueOnce('B') // list_with_initial
      .mockResolvedValueOnce('A') // list_if
      .mockResolvedValueOnce(['A', 'C']) // checkbox
      .mockResolvedValueOnce(['B', 'C']) // checkbox_with_initial
      .mockResolvedValueOnce(['A']); // checkbox_if

    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'question',
    });

    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
    expect(code).toBe(0);

    expect(
      fs.readFileSync(path.resolve(cwd, 'tmp/result.txt'), 'utf8'),
    ).toMatchSnapshot();
  });
});

describe('options', () => {
  test('options', async () => {
    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'a',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
  });

  test('force overwrite', async () => {
    vi.spyOn(prompt, 'confirm').mockRejectedValueOnce(new Error('unexpected'));

    const file = {
      dump: {
        path: path.resolve(cwd, 'tmp/nest/dump.txt'),
        content: 'dump',
      },
      generate: {
        path: path.resolve(cwd, 'tmp/generate.txt'),
        content: 'generate',
      },
    };

    mount(file);

    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'a',
      force: true,
    });

    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
    expect(code).toBe(0);

    expect(fs.readFileSync(file.dump.path, 'utf8')).not.toBe(file.dump.content);
    expect(fs.readFileSync(file.generate.path, 'utf8')).not.toBe(
      file.generate.content,
    );
  });

  test('dry run', async () => {
    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'a',
      'dry-run': true,
    });

    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('not found', async () => {
    const { code, stdout, stderr } = await runCommand(cmd, {
      ...defaults,
      name: 'not-found',
    });

    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
    expect(code).toBe(1);
  });
});
