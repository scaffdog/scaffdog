import type { Consola } from 'consola';
import type { Merge, PackageJson } from 'type-fest';
import type yargs from 'yargs';
import type { globalOptions } from './global-options';

type GlobalOptions = yargs.InferredOptionTypes<typeof globalOptions>;
type GlobalOptionsWith<T> = Merge<GlobalOptions, T>;

export type CommandContext<T> = {
  cwd: string;
  pkg: PackageJson;
  logger: Consola;
  size: { rows: number; columns: number };
  options: GlobalOptionsWith<T>;
};

export type CommandHandle<T> = (context: CommandContext<T>) => Promise<number>;

export type Command<T> = {
  name: string;
  key: string;
  description: string;
  build: (yargs: yargs.Argv) => yargs.Argv<T>;
  handle: CommandHandle<T>;
};

export type CommandCreator<T> = (handle: CommandHandle<T>) => Command<T>;

export type CommandContainer = Map<string, Command<any>>;

export type CreateCommandOptions<T> = Omit<Command<T>, 'handle'>;

export const createCommand =
  <T>(opts: CreateCommandOptions<T>): CommandCreator<T> =>
  (handle) => ({
    ...opts,
    handle,
  });
