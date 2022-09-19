import path from 'path';
import { parse } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import type yargs from 'yargs';
import type { Library } from '../lib';
import { createDocument } from '../lib/document.factory';
import { createDocumentLibraryMock } from '../lib/document.mock';
import { createFsLibraryMock } from '../lib/fs.mock';
import { createPromptLibraryMock } from '../lib/prompt.mock';
import { createQuestionLibraryMock } from '../lib/question.mock';
import { cwd, runCommand } from '../mocks/command-test-utils';
import { createLibraryMock } from '../mocks/lib';
import cmd from './generate';

const run = (
  args: Partial<yargs.InferredOptionTypes<typeof cmd['args']>>,
  flags: Partial<yargs.InferredOptionTypes<typeof cmd['flags']>>,
  lib: Library,
) =>
  runCommand(
    cmd,
    {
      name: undefined,
      ...args,
    },
    {
      'dry-run': false,
      force: false,
      answer: [],
      ...flags,
    },
    lib,
  );

const documents = [
  createDocument({
    name: 'basic',
    root: '.',
    output: '.',
    templates: [
      {
        filename: parse('static.txt'),
        content: parse('static content'),
      },
      {
        filename: parse('dir/{{ inputs.value }}.txt'),
        content: parse('{{ inputs.value }}'),
      },
    ],
  }),
  createDocument({
    name: 'multiple',
    root: '.',
    output: '**/*',
    templates: [
      {
        filename: parse('static.txt'),
        content: parse('static content'),
      },
    ],
  }),
];

describe('prompt', () => {
  test('name', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'prompt',
        createPromptLibraryMock({
          prompt: vi.fn().mockResolvedValueOnce('basic'),
        }),
      )
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      )
      .provideValue(
        'fs',
        createFsLibraryMock({
          fileExists: vi.fn().mockReturnValue(false),
          mkdir: vi.fn().mockReturnValue(Promise.resolve()),
          writeFile: vi.fn().mockReturnValue(Promise.resolve()),
        }),
      );

    const { code, stdout, stderr } = await run({}, {}, lib);

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    const prompt = lib.resolve('prompt');
    expect(prompt.prompt).toBeCalledWith(
      expect.objectContaining({
        type: 'list',
        choices: documents.map((d) => d.name),
      }),
    );

    const question = lib.resolve('question');
    expect(question.resolve).toBeCalledWith(
      expect.objectContaining({
        questions: documents[0].questions,
      }),
    );

    const fs = lib.resolve('fs');
    expect(fs.mkdir).toBeCalledWith(cwd, {
      recursive: true,
    });
    expect(fs.writeFile).toBeCalledWith(
      path.join(cwd, 'static.txt'),
      'static content',
    );
    expect(fs.mkdir).toBeCalledWith(path.join(cwd, 'dir'), {
      recursive: true,
    });
    expect(fs.writeFile).toBeCalledWith(
      path.join(cwd, 'dir/scaffdog.txt'),
      'scaffdog',
    );
  });

  test('overwrite files', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'prompt',
        createPromptLibraryMock({
          prompt: vi.fn().mockResolvedValueOnce('basic'),
          confirm: vi
            .fn()
            .mockResolvedValueOnce(true) // static.txt
            .mockResolvedValueOnce(false), // dir/scaffdog.txt (skipped)
        }),
      )
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      )
      .provideValue(
        'fs',
        createFsLibraryMock({
          fileExists: vi.fn().mockReturnValue(true),
          mkdir: vi.fn().mockReturnValue(Promise.resolve()),
          writeFile: vi.fn().mockReturnValue(Promise.resolve()),
        }),
      );

    const { code, stdout, stderr } = await run({}, {}, lib);

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    const fs = lib.resolve('fs');
    expect(fs.writeFile).toBeCalledWith(
      path.join(cwd, 'static.txt'),
      'static content',
    );
    expect(fs.writeFile).toBeCalledTimes(1);
  });

  test('magic pattern and destination autocomplete', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      )
      .provideValue(
        'prompt',
        createPromptLibraryMock({
          autocomplete: vi.fn().mockResolvedValueOnce('dirB'),
        }),
      )
      .provideValue(
        'fs',
        createFsLibraryMock({
          glob: vi.fn().mockResolvedValueOnce(['dirA', 'dirB']),
        }),
      );

    const { code, stdout, stderr } = await run(
      {
        name: 'multiple',
      },
      {},
      lib,
    );

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    const fs = lib.resolve('fs');
    expect(fs.glob).toBeCalledWith(
      '**/*',
      expect.objectContaining({
        cwd,
      }),
    );

    const prompt = lib.resolve('prompt');
    expect(prompt.autocomplete).toBeCalledWith(
      expect.stringContaining('output destination'),
      ['.', 'dirA', 'dirB'],
      {},
    );
  });
});

describe('args and flags', () => {
  test('force', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      );

    const { code, stdout, stderr } = await run(
      {
        name: 'basic',
      },
      {
        force: true,
      },
      lib,
    );

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    const fs = lib.resolve('fs');
    expect(fs.fileExists).not.toBeCalled();
    expect(fs.writeFile).toBeCalledTimes(2);
  });

  test('dry-run', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      );

    const { code, stdout, stderr } = await run(
      {
        name: 'basic',
      },
      {
        'dry-run': true,
      },
      lib,
    );

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    const fs = lib.resolve('fs');
    expect(fs.fileExists).not.toBeCalled();
    expect(fs.writeFile).not.toBeCalled();
  });

  test('answers', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({}),
        }),
      );

    const { code, stdout, stderr } = await run(
      {
        name: 'basic',
      },
      {
        answer: ['key1:value', 'key2:value'],
      },
      lib,
    );

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    const question = lib.resolve('question');
    expect(question.resolve).toBeCalledWith(
      expect.objectContaining({
        answers: ['key1:value', 'key2:value'],
      }),
    );
  });

  test('no documents', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce([]),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      );

    const { code, stdout, stderr } = await run(
      {
        name: 'basic',
      },
      {},
      lib,
    );

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });

  test('not found', async () => {
    const lib = createLibraryMock()
      .provideValue(
        'document',
        createDocumentLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce(documents),
        }),
      )
      .provideValue(
        'question',
        createQuestionLibraryMock({
          resolve: vi.fn().mockResolvedValueOnce({
            value: 'scaffdog',
          }),
        }),
      );

    const { code, stdout, stderr } = await run(
      {
        name: 'not-found',
      },
      {},
      lib,
    );

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });
});
