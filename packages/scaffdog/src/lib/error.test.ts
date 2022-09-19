import path from 'path';
import { ScaffdogError } from '@scaffdog/error';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { createLogger } from '../mocks/logger';
import { createErrorLibrary } from './error';

const ROOT_PATH = path.join(__dirname, '../../../..');

describe('handle', () => {
  const createLib = () => {
    const { logger, getStdout, getStderr } = createLogger();
    const lib = createErrorLibrary(logger);
    return {
      lib,
      logger,
      getStdout,
      getStderr,
    };
  };

  test.each([
    [
      'ScaffdogError - without source',
      new ScaffdogError('message', {}),
      'Compile Error',
    ],

    [
      'ScaffdogError - with source',
      new ScaffdogError('"foo" is not defined', {
        source: `{{ foo }}`.trim(),
        range: [3, 5],
      }),
      'Compile Error',
    ],

    [
      'ZodError',
      (
        z
          .object({
            foo: z.string(),
            bar: z.object({
              baz: z.number(),
            }),
          })
          .safeParse({
            foo: 0,
            bar: {
              baz: '',
            },
            qux: false,
          }) as any
      ).error,
      'Parsing Error',
    ],

    ['Error', new Error('title'), 'General Error'],

    ['unknown', null, 'Error'],
  ])('%s', (_, e, title) => {
    const { lib, getStdout, getStderr } = createLib();
    const code = lib.handle(e, title);
    const output = (getStderr() + getStdout()).replace(
      new RegExp(ROOT_PATH, 'g'),
      '~',
    );

    expect(code).toBe(1);
    expect(output).toMatchSnapshot();
  });
});
