import yargs from 'yargs/yargs';
import type { PackageJson } from 'type-fest';
import type { Consola } from 'consola';
import { LogLevel } from 'consola';
import terminalSize from 'term-size';
import { globalOptions } from './global-options';
import type { CommandContainer } from './command';

export class CLI {
  private _pkg: PackageJson;
  private _logger: Consola;
  private _container: CommandContainer;

  public constructor(
    pkg: PackageJson,
    logger: Consola,
    container: CommandContainer,
  ) {
    this._pkg = pkg;
    this._logger = logger;
    this._container = container;

    process.on('uncaughtException', (e: null | undefined | Partial<Error>) => {
      this._logger.error(e);
      process.exit(1);
    });

    process.on('unhandledRejection', (e: null | undefined | Partial<Error>) => {
      this._logger.error(e);
      process.exit(1);
    });
  }

  public async run(argv: string[]): Promise<number> {
    const parser = yargs()
      .help(false)
      .version(false)
      .detectLocale(false)
      .wrap(terminalSize().columns)
      .parserConfiguration({
        'set-placeholder-key': true,
        'boolean-negation': false,
      })
      .fail((msg, err) => {
        throw err != null ? err : new Error(msg);
      })
      .options(globalOptions)
      .strict()
      .exitProcess(false);

    for (const cmd of this._container.values()) {
      parser.command(cmd.key, cmd.description, cmd.build);
    }

    const parsed = parser.parse(argv);

    if (parsed.verbose) {
      this._logger.level = LogLevel.Verbose;
    }

    if (parsed.version) {
      this._logger.log(`v${this._pkg.version}`);
      return 0;
    }

    if (parsed.help || parsed._.length === 0) {
      parser.showHelp((s) => {
        this._logger.log(s);
      });
      return 0;
    }

    this._logger.debug('parsed arguments: %O', parsed);

    const key = `${parsed._[0]}`;
    this._logger.debug('command key: %s', key);

    const cmd = this._container.get(key);
    if (cmd == null) {
      this._logger.error(new Error(`"${key}" command does not exists`));
      return 1;
    }

    try {
      return await cmd.handle({
        cwd: process.cwd(),
        pkg: this._pkg,
        logger: this._logger,
        size: Object.defineProperties(
          {
            rows: 0,
            columns: 0,
          },
          {
            rows: {
              enumerable: true,
              get: () => terminalSize().rows,
            },
            columns: {
              enumerable: true,
              get: () => terminalSize().columns,
            },
          },
        ),
        options: parsed,
      });
    } catch (e) {
      this._logger.error(e);
      return 1;
    }
  }
}
