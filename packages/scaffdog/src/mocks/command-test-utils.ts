import path from 'path';
import type { Command } from '../command';
import { createLogger } from './logger';

export const cwd = path.resolve(__dirname, '../../test');

export const runCommand = async <T>(
  cmd: Command<T>,
  options: T,
): Promise<{
  code: number;
  stdout: string;
  stderr: string;
}> => {
  const { logger, getStdout, getStderr } = createLogger();

  const code = await cmd.handle({
    cwd,
    pkg: {
      name: 'scaffdog',
      version: '1.0.0',
    },
    size: {
      rows: 120,
      columns: 60,
    },
    logger,
    options: {
      project: 'fixtures',
      help: false,
      version: false,
      verbose: true,
      ...options,
    },
  });

  return {
    code,
    stdout: getStdout(),
    stderr: getStderr(),
  };
};
