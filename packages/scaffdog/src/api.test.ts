import path from 'node:path';
import { parse } from '@scaffdog/engine';
import { describe, expect, test, vi } from 'vitest';
import { createScaffdogInitializer } from './api.js';
import { createResolvedConfig } from './lib/config.factory';
import { createDocument } from './lib/document.factory';
import { createDocumentLibraryMock } from './lib/document.mock';
import { createLibraryMock } from './mocks/lib.js';
import { createFile } from './file.factory';

const cwd = '/path/test';

describe('createScaffdog', () => {
  test('fields', async () => {
    const { createScaffdog } = createScaffdogInitializer({
      lib: createLibraryMock(),
    });

    const config = createResolvedConfig();

    const scaffdog = createScaffdog({
      filepath: path.join(cwd, '.scaffdog/config.js'),
      config,
      cwd,
    });

    expect(scaffdog).toEqual({
      path: {
        project: path.join(cwd, '.scaffdog'),
        config: path.join(cwd, '.scaffdog/config.js'),
      },
      config,
      list: expect.any(Function),
      generate: expect.any(Function),
    });
  });

  test('list', async () => {
    const documents = [
      createDocument({
        name: 'doc1',
      }),
    ];

    const lib = createLibraryMock({
      document: createDocumentLibraryMock({
        resolve: vi.fn().mockResolvedValueOnce(documents),
      }),
    });

    const { createScaffdog } = createScaffdogInitializer({
      lib,
    });

    const scaffdog = createScaffdog({
      filepath: path.join(cwd, '.scaffdog/config.js'),
      config: createResolvedConfig({
        files: ['*'],
        tags: ['<%', '%>'],
      }),
      cwd,
    });

    const results = await scaffdog.list();

    expect(results).toEqual(documents);

    expect(lib.document.resolve).toBeCalledWith(
      path.join(cwd, '.scaffdog'),
      ['*'],
      {
        tags: ['<%', '%>'],
      },
    );
  });

  test('generate - inputs record', async () => {
    const { createScaffdog } = createScaffdogInitializer({
      lib: createLibraryMock(),
    });

    const scaffdog = createScaffdog({
      filepath: path.join(cwd, '.scaffdog/config.js'),
      config: createResolvedConfig(),
      cwd,
    });

    const files = await scaffdog.generate(
      createDocument({
        name: 'test',
        path: path.join(cwd, '.scaffdog/test.md'),
        variables: new Map([['global', parse('{{ inputs.value | upper }}')]]),
        templates: [
          {
            filename: parse('{{ inputs.value }}.txt'),
            content: parse(
              [
                '{{ cwd }}',
                '{{ document.path }}',
                '{{ output.name }}',
                '{{ output.ext }}',
                '{{ global }}',
              ].join('\n'),
            ),
          },
          {
            filename: parse('!skip.txt'),
            content: parse(''),
          },
        ],
      }),
      path.join(cwd, 'dist'),
      {
        inputs: {
          value: 'scaffdog',
        },
      },
    );

    expect(files).toEqual([
      createFile({
        skip: false,
        name: 'scaffdog.txt',
        path: path.join(cwd, 'dist/scaffdog.txt'),
        content: [
          cwd,
          path.join(cwd, '.scaffdog/test.md'),
          'scaffdog',
          '.txt',
          'SCAFFDOG',
        ].join('\n'),
      }),
      createFile({
        skip: true,
        name: 'skip.txt',
        path: path.join(cwd, 'dist/skip.txt'),
        content: '',
      }),
    ]);
  });

  test('generate - inputs factory', async () => {
    const { createScaffdog } = createScaffdogInitializer({
      lib: createLibraryMock(),
    });

    const scaffdog = createScaffdog({
      filepath: path.join(cwd, '.scaffdog/config.js'),
      config: createResolvedConfig(),
      cwd,
    });

    const files = await scaffdog.generate(
      createDocument({
        name: 'test',
        path: path.join(cwd, '.scaffdog/test.md'),
        templates: [
          {
            filename: parse('{{ inputs.value }}.txt'),
            content: parse(''),
          },
        ],
      }),
      path.join(cwd, 'dist'),
      {
        inputs: async () => ({ value: 'scaffdog' }),
      },
    );

    expect(files).toEqual([
      createFile({
        skip: false,
        name: 'scaffdog.txt',
        path: path.join(cwd, 'dist/scaffdog.txt'),
        content: '',
      }),
    ]);
  });
});
