#!/usr/bin/env node
import consola, { FancyReporter } from 'consola';
import type { PackageJson } from 'type-fest';
import updateNotifier from 'update-notifier';
import { CLI } from './cli';
import { CommandContainer } from './command-container';
import { commands } from './commands';

(async () => {
  const logger = consola.create({
    reporters: [
      new FancyReporter({
        formatOptions: {
          date: false,
        } as any,
      }),
    ],
  });

  process.on('uncaughtException', (e: null | undefined | Partial<Error>) => {
    logger.error(e);
    process.exit(1);
  });

  process.on('unhandledRejection', (e: null | undefined | Partial<Error>) => {
    logger.error(e);
    process.exit(1);
  });

  try {
    const pkg = require('../package.json') as PackageJson;

    updateNotifier({
      pkg: pkg as any,
      distTag: pkg.version?.includes('canary') ? 'canary' : 'latest',
    }).notify();

    const container = new CommandContainer(commands);
    const cli = new CLI(pkg, logger, container);
    const code = await cli.run(process.argv.slice(2));

    logger.log('');

    process.exit(code);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
