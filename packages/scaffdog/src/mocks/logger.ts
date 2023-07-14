import { PassThrough } from 'stream';
import type { ConsolaInstance } from 'consola';
import { LogLevels, createConsola } from 'consola';
import stripAnsi from 'strip-ansi';

export const createLogger = (): {
  logger: ConsolaInstance;
  getStdout: () => string;
  getStderr: () => string;
} => {
  const output = {
    stdout: '',
    stderr: '',
  };

  const stream = {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
  };

  const logger = createConsola({
    fancy: true,
    formatOptions: {
      date: false,
    },
    level: LogLevels.info,
    ...(stream as any),
  });

  stream.stdout.on('data', (chunk) => (output.stdout += chunk));
  stream.stderr.on('data', (chunk) => (output.stderr += chunk));

  return {
    logger,
    getStdout: () => stripAnsi(output.stdout),
    getStderr: () => stripAnsi(output.stderr),
  };
};
