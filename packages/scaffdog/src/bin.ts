#!/usr/bin/env node
import type { PackageJson } from 'type-fest';
import consola, { FancyReporter } from 'consola';
import updateNotifier from 'update-notifier';
import { CLI } from './cli';
import type { CommandContainer } from './command';
import initCmd from './cmds/init';
import listCmd from './cmds/list';
import generateCmd from './cmds/generate';
import createCmd from './cmds/create';

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

  const container: CommandContainer = new Map();
  container.set(initCmd.name, initCmd);
  container.set(listCmd.name, listCmd);
  container.set(generateCmd.name, generateCmd);
  container.set(createCmd.name, createCmd);

  try {
    const pkg = require('../package.json') as PackageJson;

    updateNotifier({
      pkg: pkg as any,
      distTag: pkg.version?.includes('canary') ? 'canary' : 'latest',
    }).notify();

    const cli = new CLI(pkg, logger, container);
    const code = await cli.run(process.argv.slice(2));

    logger.log('');

    process.exit(code);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
