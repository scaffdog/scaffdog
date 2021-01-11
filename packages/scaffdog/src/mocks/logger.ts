import { PassThrough } from 'stream';
import stripAnsi from 'strip-ansi';
import type { Consola } from 'consola';
import consola, { FancyReporter } from 'consola';

export const createLogger = (): {
  logger: Consola;
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

  const logger = consola.create({
    reporters: [
      new FancyReporter({
        formatOptions: {
          date: false,
        } as any,
      }),
    ],
    ...stream,
  });

  stream.stdout.on('data', (chunk) => (output.stdout += chunk));
  stream.stderr.on('data', (chunk) => (output.stderr += chunk));

  return {
    logger,
    getStdout: () => stripAnsi(output.stdout),
    getStderr: () => stripAnsi(output.stderr),
  };
};
