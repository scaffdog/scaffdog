import path from 'path';
import type {
  AnyCommandModule,
  CommandArgs,
  CommandModule,
  CommandOption,
  GlobalFlags,
  GlobalFlagsWith,
  InferredCommandModuleArgs,
  InferredCommandModuleFlags,
} from '../command';
import type { CommandContainer } from '../command-container';
import { createCommandContainer } from '../command-container';
import type { Library } from '../lib';
import { createLibraryMock } from './lib';
import { createLogger } from './logger';

export const cwd = path.resolve(__dirname, '../../');

export type CommandRunnerParams<T extends AnyCommandModule> = {
  args?: Partial<CommandArgs<InferredCommandModuleArgs<T>>>;
  flags?: Partial<GlobalFlagsWith<CommandArgs<InferredCommandModuleFlags<T>>>>;
  lib?: Library;
  container?: CommandContainer;
};

export type CommandRunner<T extends AnyCommandModule> = (
  params: CommandRunnerParams<T>,
) => Promise<{
  code: number;
  stdout: string;
  stderr: string;
}>;

export const createCommandRunner =
  <A extends CommandOption, F extends CommandOption>(
    cmd: CommandModule<A, F>,
    defaults: {
      args: CommandArgs<A>;
      flags: CommandArgs<F>;
    },
  ): CommandRunner<CommandModule<A, F>> =>
  async ({ args, flags, lib, container }) => {
    const { logger, getStdout, getStderr } = createLogger();

    const globalFlags: GlobalFlags = {
      project: '.scaffdog',
      help: false,
      version: false,
      verbose: true,
    };

    const code = await cmd.run({
      cwd,
      pkg: {
        name: 'scaffdog',
        version: '1.0.0',
        description: 'scaffdog is Markdown driven scaffolding tool.',
      },
      size: {
        rows: 120,
        columns: 60,
      },
      logger,
      container: container ?? createCommandContainer([]),
      lib: lib ?? createLibraryMock({}),
      args: {
        ...defaults.args,
        ...(args ?? {}),
      },
      flags: {
        ...defaults.flags,
        ...globalFlags,
        ...(flags ?? {}),
      } as never,
    });

    return {
      code,
      stdout: getStdout(),
      stderr: getStderr(),
    };
  };
