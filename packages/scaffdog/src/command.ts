import type { Consola } from 'consola';
import type { Merge, PackageJson } from 'type-fest';
import type yargs from 'yargs';
import type { CommandContainer } from './command-container';
import type { globalFlags } from './global-flags';

export type GlobalFlags = yargs.InferredOptionTypes<typeof globalFlags>;
export type GlobalFlagsWith<T> = Merge<GlobalFlags, T>;

export type CommandOption = {
  [key: string]: yargs.Options;
};

export type CommandArgs<T extends CommandOption> = yargs.InferredOptionTypes<T>;

export type CommandContext<A extends CommandOption, F extends CommandOption> = {
  cwd: string;
  pkg: PackageJson;
  container: CommandContainer;
  logger: Consola;
  size: {
    rows: number;
    columns: number;
  };
  args: CommandArgs<A>;
  flags: GlobalFlagsWith<CommandArgs<F>>;
};

export type CommandRunner<A extends CommandOption, F extends CommandOption> = (
  context: CommandContext<A, F>,
) => Promise<number>;

export type CommandDefinition<
  A extends CommandOption = CommandOption,
  F extends CommandOption = CommandOption,
> = {
  name: string;
  summary: string;
  args: A;
  flags: F;
  commands?: CommandModule<any, any>[];
};

export type CommandModule<
  A extends CommandOption = CommandOption,
  F extends CommandOption = CommandOption,
> = CommandDefinition<A, F> & {
  run: CommandRunner<A, F>;
  build: yargs.BuilderCallback<any, any>;
};

export type CommandList = Map<string, CommandModule<any, any>>;

export type CommandFactory<
  A extends CommandOption = CommandOption,
  F extends CommandOption = CommandOption,
> = (runner: CommandRunner<A, F>) => CommandModule<A, F>;

const buildCommandSignature = (name: string, args: CommandOption): string => {
  const arr = [name];

  Object.entries(args).forEach(([key, opts]) => {
    const inner = opts.array ? `${key}..` : key;
    arr.push(opts.demandOption ? `<${inner}>` : `[${inner}]`);
  });

  return arr.join(' ');
};

export const buildCommand = <A extends CommandOption, F extends CommandOption>(
  yargs: yargs.Argv<any>,
  module: CommandModule<A, F>,
): yargs.Argv<any> => {
  return yargs.command(
    buildCommandSignature(module.name, module.args),
    '',
    module.build,
  );
};

export const createCommand = <A extends CommandOption, F extends CommandOption>(
  definition: CommandDefinition<A, F>,
): CommandFactory<A, F> => {
  return (run) => {
    return {
      ...definition,
      build: (yargs) => {
        yargs.options(definition.flags);

        Object.entries(definition.args).forEach(([key, opts]) => {
          yargs.positional(key, opts as any);
        });

        if (definition.commands != null) {
          definition.commands.forEach((module) => {
            buildCommand(yargs, module);
          });
        }

        return yargs;
      },
      run,
    };
  };
};
