import path from 'path';
import { parse } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import { createResolvedConfig } from '../lib/config.factory';
import { createConfigLibraryMock } from '../lib/config.mock';
import { createDocument } from '../lib/document.factory';
import { createDocumentLibraryMock } from '../lib/document.mock';
import { createCommandRunner, cwd } from '../mocks/command-test-utils';
import { createLibraryMock } from '../mocks/lib';
import cmd from './list';

const config = createConfigLibraryMock({
  load: () =>
    createResolvedConfig({
      files: ['./*'],
      tags: ['{{', '}}'],
    }),
});

const run = createCommandRunner(cmd, {
  args: {},
  flags: {},
});

test('success', async () => {
  const documents = [
    createDocument({
      name: 'doc1',
      path: path.join(cwd, '.scaffdog/doc1.md'),
      templates: [
        {
          filename: parse('1'),
          content: parse('1'),
        },
      ],
    }),
    createDocument({
      name: 'doc2',
      path: path.join(cwd, '.scaffdog/doc2.md'),
      templates: [
        {
          filename: parse('1'),
          content: parse('1'),
        },
        {
          filename: parse('2'),
          content: parse('2'),
        },
      ],
      questions: {
        key1: 'msg',
      },
    }),
    createDocument({
      name: 'doc3',
      path: path.join(cwd, '.scaffdog/doc3.md'),
      templates: [
        {
          filename: parse('1'),
          content: parse('1'),
        },
      ],
      questions: {
        key1: 'msg',
        key2: 'msg',
      },
    }),
  ];

  const lib = createLibraryMock({
    config,
    document: createDocumentLibraryMock({
      resolve: vi.fn().mockResolvedValueOnce(documents),
    }),
  });

  const { code, stdout, stderr } = await run({
    lib,
  });

  expect(code).toBe(0);
  expect(stderr).toBe('');
  expect(stdout).toMatchSnapshot();

  expect(lib.document.resolve).toBeCalledWith(
    path.resolve(cwd, '.scaffdog'),
    ['./*'],
    {
      tags: ['{{', '}}'],
    },
  );
});

describe('failure', () => {
  test('config not found', async () => {
    const lib = createLibraryMock({
      config: createConfigLibraryMock({
        load: vi.fn().mockReturnValueOnce(null),
      }),
    });

    const { code, stdout, stderr } = await run({
      lib,
    });

    expect(code).toBe(1);
    expect(stderr).toBe('');
    expect(stdout).toBe('');
  });

  test('document not found', async () => {
    const lib = createLibraryMock({
      config,
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce([]),
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
