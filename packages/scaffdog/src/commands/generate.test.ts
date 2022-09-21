import path from 'path';
import { parse } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import { createResolvedConfig } from '../lib/config.factory';
import { createConfigLibraryMock } from '../lib/config.mock';
import { createDocument } from '../lib/document.factory';
import { createDocumentLibraryMock } from '../lib/document.mock';
import { createFsLibraryMock } from '../lib/fs.mock';
import { createPromptLibraryMock } from '../lib/prompt.mock';
import { createQuestionLibraryMock } from '../lib/question.mock';
import { createCommandRunner, cwd } from '../mocks/command-test-utils';
import { createLibraryMock } from '../mocks/lib';
import cmd from './generate';

const run = createCommandRunner(cmd, {
  args: {
    name: undefined,
  },
  flags: {
    output: undefined,
    answer: undefined,
    'dry-run': false,
    force: false,
  },
});

const config = createConfigLibraryMock({
  load: () => createResolvedConfig(),
});

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
  createDocument({
    name: 'root',
    root: 'src',
    output: '**/*',
    templates: [
      {
        filename: parse('file.txt'),
        content: parse('content'),
      },
    ],
  }),
];

describe('prompt', () => {
  test('name', async () => {
    const lib = createLibraryMock({
      config,
      prompt: createPromptLibraryMock({
        prompt: vi.fn().mockResolvedValueOnce('basic'),
      }),
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
      fs: createFsLibraryMock({
        fileExists: vi.fn().mockReturnValue(false),
        mkdir: vi.fn().mockReturnValue(Promise.resolve()),
        writeFile: vi.fn().mockReturnValue(Promise.resolve()),
      }),
    });

    const { code, stdout, stderr } = await run({
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.prompt.prompt).toBeCalledWith(
      expect.objectContaining({
        type: 'list',
        choices: documents.map((d) => d.name),
      }),
    );

    expect(lib.question.resolve).toBeCalledWith(
      expect.objectContaining({
        questions: documents[0].questions,
      }),
    );

    expect(lib.fs.mkdir).toBeCalledWith(cwd, {
      recursive: true,
    });
    expect(lib.fs.writeFile).toBeCalledWith(
      path.join(cwd, 'static.txt'),
      'static content',
    );
    expect(lib.fs.mkdir).toBeCalledWith(path.join(cwd, 'dir'), {
      recursive: true,
    });
    expect(lib.fs.writeFile).toBeCalledWith(
      path.join(cwd, 'dir/scaffdog.txt'),
      'scaffdog',
    );
  });

  test('overwrite files', async () => {
    const lib = createLibraryMock({
      config,
      prompt: createPromptLibraryMock({
        prompt: vi.fn().mockResolvedValueOnce('basic'),
        confirm: vi
          .fn()
          .mockResolvedValueOnce(true) // static.txt
          .mockResolvedValueOnce(false), // dir/scaffdog.txt (skipped)
      }),
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
      fs: createFsLibraryMock({
        fileExists: vi.fn().mockReturnValue(true),
        mkdir: vi.fn().mockReturnValue(Promise.resolve()),
        writeFile: vi.fn().mockReturnValue(Promise.resolve()),
      }),
    });

    const { code, stdout, stderr } = await run({
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.fs.writeFile).toBeCalledWith(
      path.join(cwd, 'static.txt'),
      'static content',
    );
    expect(lib.fs.writeFile).toBeCalledTimes(1);
  });

  test('magic pattern and destination autocomplete', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
      prompt: createPromptLibraryMock({
        autocomplete: vi.fn().mockResolvedValueOnce('dirB'),
      }),
      fs: createFsLibraryMock({
        glob: vi.fn().mockResolvedValueOnce(['dirA', 'dirB']),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'multiple',
      },
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.fs.glob).toBeCalledWith(
      '**/*',
      expect.objectContaining({
        cwd,
      }),
    );

    expect(lib.prompt.autocomplete).toBeCalledWith(
      expect.stringContaining('output destination'),
      ['.', 'dirA', 'dirB'],
      {},
    );
  });
});

describe('args and flags', () => {
  test('force', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      flags: {
        force: true,
      },
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.fs.fileExists).not.toBeCalled();
    expect(lib.fs.writeFile).toBeCalledTimes(2);
  });

  test('dry-run', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      flags: {
        'dry-run': true,
      },
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.fs.fileExists).not.toBeCalled();
    expect(lib.fs.writeFile).not.toBeCalled();
  });

  test('output', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({}),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'root',
      },
      flags: {
        output: 'dir/nest',
      },
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.fs.writeFile).toBeCalledWith(
      path.join(cwd, 'src/dir/nest/file.txt'),
      'content',
    );
  });

  test('answers', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({}),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      flags: {
        answer: ['key1:value', 'key2:value'],
      },
      lib,
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(lib.question.resolve).toBeCalledWith(
      expect.objectContaining({
        answers: ['key1:value', 'key2:value'],
      }),
    );
  });

  test('no documents', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce([]),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      lib,
    });

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });

  test('not found', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'not-found',
      },
      lib,
    });

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });
});
