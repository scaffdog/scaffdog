import chalk from 'chalk';
import type * as yargs from 'yargs';
import { createCommand } from '../command.js';
import { globalFlags } from '../global-flags.js';
import { buildUsage } from '../utils/usage.js';

const buildFlagName = (name: string, opts: yargs.Options) => {
  if (opts.alias != null) {
    const aliases = typeof opts.alias === 'string' ? [opts.alias] : opts.alias;
    const alias = aliases.map((s) => `-${s}`).join(', ');
    return `${alias}, --${name}`;
  }

  return `    --${name}`;
};

const globalFlagsContent = {
  header: 'GLOBAL FLAGS',
  content: Object.entries(globalFlags).map(([name, opts]) => ({
    name: buildFlagName(name, opts),
    summary: opts.description,
  })),
};

export default createCommand({
  name: 'help',
  summary: 'Show help.',
  args: {
    command: {
      type: 'string',
      array: true,
    },
  },
  flags: {},
})(async ({ pkg, logger, container, args }) => {
  const command = (args.command ?? []) as string[];
  const name = command.join('.');

  // command help
  if (name !== '') {
    const module = container.get(name);
    if (module == null) {
      logger.error(`"${name}" command does not exists`);
      return 1;
    }

    let usage = `scaffdog ${command.join(' ')}`;

    if (module.commands != null) {
      usage += ' <command>';
    }

    const args = Object.entries(module.args);
    if (args.length > 0) {
      const multiple = args.length > 1;
      const overview = args
        .map(([arg, opts]) => {
          return opts.array === true ? `<${arg}..>` : `<${arg}>`;
        })
        .join(' | ');

      usage += ` ${multiple ? '{' : ''}${overview}${multiple ? '}' : ''}`;
    }

    if (Object.keys(module.flags).length > 0) {
      usage += ' [flags]';
    }

    const availableCommands =
      module.commands != null
        ? module.commands.map((cmd) => ({
            name: cmd.name,
            summary: cmd.summary,
          }))
        : [];

    const cmdFlags = Object.entries(module.flags).map(([key, opts]) => ({
      name: buildFlagName(key, opts),
      summary: opts.description!,
    }));

    logger.log(
      buildUsage([
        {
          content: module.summary,
          raw: true,
        },
        {
          header: 'USAGE',
          content: usage,
        },
        ...(availableCommands.length > 0
          ? [
              {
                header: 'AVAILABLE COMMANDS',
                content: availableCommands,
              },
            ]
          : []),
        ...(cmdFlags.length > 0
          ? [
              {
                header: 'COMMAND FLAGS',
                content: cmdFlags,
              },
            ]
          : []),
        globalFlagsContent,
      ]),
    );

    return 0;
  }

  // global help
  const main = container.main();

  logger.log(
    buildUsage([
      {
        content: pkg.description!,
        raw: true,
      },
      {
        header: 'USAGE',
        content: [
          'scaffdog',
          '<command>',
          main.length > 0 ? '[subcommand..]' : '',
          '[flags]',
        ]
          .filter(Boolean)
          .join(' '),
      },
      ...(main.length > 0
        ? [
            {
              header: 'AVAILABLE COMMANDS',
              content: main.map((module) => ({
                name: module.name,
                summary: module.summary,
              })),
            },
          ]
        : []),
      globalFlagsContent,
      {
        content: chalk`{gray Run {bold scaffdog help [command..]} for help with a specific command.}`,
        raw: true,
      },
    ]),
  );

  return 0;
});
