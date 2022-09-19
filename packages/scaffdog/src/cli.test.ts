import { LogLevel } from 'consola';
import { describe, expect, test, vi } from 'vitest';
import { createCLI } from './cli';
import type { CommandModule } from './command';
import { createCommand } from './command';
import { createCommandContainer } from './command-container';
import { createLibraryMock } from './mocks/lib';
import { createLogger } from './mocks/logger';

const pkg = {
  name: 'scaffdog',
  version: '1.0.0',
};

describe('run', () => {
  const lib = createLibraryMock();

  const createContainer = (commands: CommandModule<any, any>[] = []) => {
    return createCommandContainer([
      createCommand({
        name: 'help',
        summary: '',
        args: {},
        flags: {},
      })(vi.fn().mockResolvedValueOnce(0)),
      createCommand({
        name: 'version',
        summary: '',
        args: {},
        flags: {},
      })(vi.fn().mockResolvedValueOnce(0)),
      ...commands,
    ]);
  };

  test('0 arguments', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
    });

    expect(await cli.run([])).toBe(0);
    expect(container.mustGet('help').run).toBeCalledWith(
      expect.objectContaining({
        args: {
          command: [],
        },
      }),
    );
  });

  test('help', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
    });

    expect(await cli.run(['--help'])).toBe(0);
    expect(container.mustGet('help').run).toBeCalledWith(
      expect.objectContaining({
        args: {
          command: [],
        },
      }),
    );
  });

  test('command with help', async () => {
    const { logger } = createLogger();
    const cmd = createCommand({
      name: 'foo',
      summary: '',
      args: {},
      flags: {},
    })(async () => 0);
    const container = createContainer([cmd]);
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
    });

    expect(await cli.run(['foo', '--help'])).toBe(0);
    expect(container.mustGet('help').run).toBeCalledWith(
      expect.objectContaining({
        args: {
          command: ['foo'],
        },
      }),
    );
  });

  test('version', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
    });

    expect(await cli.run(['--version'])).toBe(0);
    expect(container.mustGet('version').run).toBeCalled();
  });

  test('verbose', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
    });

    expect(await cli.run(['--verbose'])).toBe(0);
    expect(logger.level).toBe(LogLevel.Verbose);
  });

  test('command (valid)', async () => {
    const { logger, getStdout } = createLogger();
    const cmd = createCommand({
      name: 'cmd',
      summary: '',
      args: {},
      flags: {},
    })(async ({ logger }) => {
      logger.log('CALL CMD');
      return 1234;
    });
    const container = createContainer([cmd]);

    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
    });

    expect(await cli.run(['cmd'])).toBe(1234);
    expect(getStdout()).toEqual(expect.stringMatching(/CALL\sCMD/));
  });

  test('command (not found)', async () => {
    const { logger } = createLogger();
    const cli = createCLI({
      pkg,
      logger,
      container: createCommandContainer([]),
      lib,
    });

    expect(await cli.run(['cmd'])).toBe(1);
  });
});
