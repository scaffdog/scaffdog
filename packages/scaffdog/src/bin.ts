#!/usr/bin/env node
import { createRequire } from 'module';
import { LogLevels, createConsola } from 'consola';
import type { PackageJson } from 'type-fest';
import updateNotifier from 'update-notifier';
import { createScaffdogInitializer } from './api.js';
import { createCLI } from './cli.js';
import { createCommandContainer } from './command-container.js';
import { commands } from './commands/index.js';
import { createLibrary } from './lib/index.js';

const require = createRequire(import.meta.url);

(async () => {
  const logger = createConsola({
    level: LogLevels.info,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fancy: true,
    formatOptions: {
      date: false,
    },
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
