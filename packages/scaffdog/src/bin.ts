#!/usr/bin/env node
import { createRequire } from 'module';
import consola, { FancyReporter } from 'consola';
import type { PackageJson } from 'type-fest';
import updateNotifier from 'update-notifier';
import { createScaffdogInitializer } from './api';
import { createCLI } from './cli';
import { createCommandContainer } from './command-container';
import { commands } from './commands';
import { createLibrary } from './lib';

const require = createRequire(import.meta.url);

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

    const container = createCommandContainer(commands);
    const lib = createLibrary(logger);
    const { createScaffdog: api } = createScaffdogInitializer({
      lib,
    });

    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    const code = await cli.run(process.argv.slice(2));

    logger.log('');

    process.exit(code);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
