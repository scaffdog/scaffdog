import { LogLevel } from 'consola';
import { describe, expect, test } from 'vitest';
import { CLI } from './cli';
import { createCommand } from './command';
import { createLogger } from './mocks/logger';

const pkg = {
  name: 'scaffdog',
  version: '1.0.0',
};

describe('run', () => {
  test('0 arguments', async () => {
    const { logger, getStdout } = createLogger();
    const cli = new CLI(pkg, logger, new Map());

    expect(await cli.run([])).toBe(0);
    expect(getStdout()).toEqual(expect.stringMatching(/Options:/));
  });

  test('help', async () => {
    const { logger, getStdout } = createLogger();
    const cli = new CLI(pkg, logger, new Map());

    expect(await cli.run(['--help'])).toBe(0);
    expect(getStdout()).toEqual(expect.stringMatching(/Options:/));
  });

  test('version', async () => {
    const { logger, getStdout } = createLogger();
    const cli = new CLI(pkg, logger, new Map());

    expect(await cli.run(['--version'])).toBe(0);
    expect(getStdout()).toEqual(expect.stringMatching(/1\.0\.0/));
  });

  test('verbose', async () => {
    const { logger } = createLogger();
    const cli = new CLI(pkg, logger, new Map());

    expect(await cli.run(['--verbose'])).toBe(0);
    expect(logger.level).toBe(LogLevel.Verbose);
  });

  test('command (valid)', async () => {
    const { logger, getStdout } = createLogger();
    const cmd = createCommand({
      name: 'cmd',
      key: 'cmd',
      description: '',
      build: (yargs) => yargs,
    })(async ({ logger }) => {
      logger.log('CALL CMD');
      return 1234;
    });

    const cli = new CLI(pkg, logger, new Map([['cmd', cmd]]));

    expect(await cli.run(['cmd'])).toBe(1234);
    expect(getStdout()).toEqual(expect.stringMatching(/CALL\sCMD/));
  });

  test('command (not found)', async () => {
    const { logger } = createLogger();
    const cli = new CLI(pkg, logger, new Map());

    expect(await cli.run(['cmd'])).toBe(1);
  });
});
