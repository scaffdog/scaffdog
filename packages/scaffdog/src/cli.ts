import type { Consola } from 'consola';
import { LogLevel } from 'consola';
import termSize from 'term-size';
import type { PackageJson } from 'type-fest';
import yargs from 'yargs/yargs';
import type { ScaffdogFactory } from './api';
import type { CommandOption } from './command';
import { buildCommand } from './command';
import type { CommandContainer } from './command-container';
import { globalFlags } from './global-flags';
import type { Library } from './lib';

export type CLI = {
  run: (argv: string[]) => Promise<number>;
};

export type CreateCLIOptions = {
  pkg: PackageJson;
  logger: Consola;
  container: CommandContainer;
  lib: Library;
  api: ScaffdogFactory;
};

export const createCLI = ({
  pkg,
  logger,
  container,
  lib,
  api,
}: CreateCLIOptions): CLI => ({
  run: async (argv) => {
    const parser = yargs()
      .help(false)
      .version(false)
      .detectLocale(false)
      .parserConfiguration({
        'set-placeholder-key': true,
        'boolean-negation': false,
      })
      .fail((msg, err) => {
        throw err != null ? err : new Error(msg);
      })
      .options(globalFlags)
      .strict()
      .exitProcess(false);

    container.all().forEach((module) => {
      buildCommand(parser, module);
    });

    const parsed = await (async () => {
      try {
        return await parser.parse(argv);
      } catch (e) {
        logger.error(e);
        return null;
      }
    })();

    if (parsed == null) {
      return 1;
    }

    const { _, $0, ...rest } = parsed;

    const context = {
      cwd: process.cwd(),
      pkg,
      logger,
      container,
      lib,
      api,
      size: Object.defineProperties(
        {
          rows: 0,
          columns: 0,
        },
        {
          rows: {
            enumerable: true,
            get: () => termSize().rows,
          },
          columns: {
            enumerable: true,
            get: () => termSize().columns,
          },
        },
      ),
    };

    logger.debug('parsed arguments: %O', parsed);

    if (parsed.verbose) {
      logger.level = LogLevel.Verbose;
    }

    if (parsed.version) {
      return await container.mustGet('version').run({
        ...context,
        args: {},
        flags: rest,
      });
    }

    if (parsed.help || _.length === 0) {
      return await container.mustGet('help').run({
        ...context,
        args: {
          command: _,
        },
        flags: rest,
      });
    }

    const command = _.join('.') || 'help';

    logger.debug(`command "${command}"`);
    logger.debug('running command...');

    try {
      const cmd = container.mustGet(command);

      const key = {
        args: new Set(Object.keys(cmd.args)),
        flags: new Set(Object.keys(cmd.flags)),
      };

      const { args, flags } = Object.entries(rest).reduce<{
        args: CommandOption;
        flags: CommandOption;
      }>(
        (acc, [k, v]) => {
          if (key.args.has(k)) {
            acc.args[k] = v as any;
          } else if (key.flags.has(k)) {
            acc.flags[k] = v as any;
          }
          return acc;
        },
        {
          args: {},
          flags: {},
        },
      );

      return await cmd.run({
        ...context,
        args,
        flags: {
          ...rest,
          ...flags,
        },
      });
    } catch (e) {
      logger.error(e);
      return 1;
    }
  },
});
