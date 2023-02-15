import path from 'path';
import { createContext, parse } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import type { GenerateInputsResolver, Scaffdog } from '../api';
import type { File } from '../file';
import { createFile } from '../file.factory';
import { createResolvedConfig } from '../lib/config.factory';
import { createConfigLibraryMock } from '../lib/config.mock';
import { createDocument } from '../lib/document.factory';
import { createFsLibraryMock } from '../lib/fs.mock';
import { createPromptLibraryMock } from '../lib/prompt.mock';
import { createQuestionLibraryMock } from '../lib/question.mock';
import { createScaffdogMock } from '../mocks/api';
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

const files = [
  createFile({
    name: 'static.txt',
    path: path.join(cwd, 'static.txt'),
    content: 'static content',
  }),
  createFile({
    name: 'dir/scaffdog.txt',
    path: path.join(cwd, 'dir/scaffdog.txt'),
    content: 'scaffdog',
  }),
];

const answers = {
  value: 'scaffdog',
};

const createGenerateMock = (files: File[]): Scaffdog['generate'] =>
  vi.fn(async (_document, _output, opts) => {
    await (opts!.inputs as GenerateInputsResolver)(createContext({}));
    return files;
  });

describe('prompt', () => {
  test('name', async () => {
    const lib = createLibraryMock({
      config,
      prompt: createPromptLibraryMock({
        prompt: vi.fn().mockResolvedValueOnce('basic'),
      }),
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(answers),
      }),
      fs: createFsLibraryMock({
        fileExists: vi.fn().mockReturnValue(false),
        mkdir: vi.fn().mockReturnValue(Promise.resolve()),
        writeFile: vi.fn().mockReturnValue(Promise.resolve()),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock(files),
    });

    const { code, stdout, stderr } = await run({
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();

    expect(scaffdog.list).toBeCalledWith();

    expect(scaffdog.generate).toBeCalledWith(
      documents[0],
      path.resolve(cwd, '.'),
      {
        inputs: expect.any(Function),
      },
    );

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

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock(files),
    });

    const { code, stdout, stderr } = await run({
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
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
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(answers),
      }),
      prompt: createPromptLibraryMock({
        autocomplete: vi.fn().mockResolvedValueOnce('dirB'),
      }),
      fs: createFsLibraryMock({
        glob: vi.fn().mockResolvedValueOnce(['dirA', 'dirB']),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock([
        createFile({
          path: path.join(cwd, 'dirB/static.txt'),
          content: 'static content',
        }),
      ]),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'multiple',
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
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
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({
          value: 'scaffdog',
        }),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock(files),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      flags: {
        force: true,
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
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
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(answers),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock(files),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      flags: {
        'dry-run': true,
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
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
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({}),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock([
        createFile({
          name: 'src/dir/nest/file.txt',
          path: path.join(cwd, 'src/dir/nest/file.txt'),
          content: 'content',
        }),
      ]),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'root',
      },
      flags: {
        output: 'dir/nest',
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
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
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce({}),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock([
        files[0],
        createFile({
          name: 'dir/.txt',
          path: path.join(cwd, 'dir/.txt'),
          content: '',
        }),
      ]),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      flags: {
        answer: ['key1:value', 'key2:value'],
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
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
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(answers),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce([]),
      generate: createGenerateMock([]),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'basic',
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
    });

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });

  test('not found', async () => {
    const lib = createLibraryMock({
      config,
      question: createQuestionLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(answers),
      }),
    });

    const scaffdog = createScaffdogMock({
      list: vi.fn().mockResolvedValueOnce(documents),
      generate: createGenerateMock(files),
    });

    const { code, stdout, stderr } = await run({
      args: {
        name: 'not-found',
      },
      lib,
      api: vi.fn().mockReturnValueOnce(scaffdog),
    });

    expect(code).toBe(1);
    expect(stderr).toMatchSnapshot();
    expect(stdout).toBe('');
  });
});
