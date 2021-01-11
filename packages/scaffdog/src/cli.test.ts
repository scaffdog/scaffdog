import test from 'ava';
import { LogLevel } from 'consola';
import { CLI } from './cli';
import { createCommand } from './command';
import { createLogger } from './mocks/logger';

const pkg = {
  name: 'scaffdog',
  version: '1.0.0',
};

test('run - 0 arguments', async (t) => {
  const { logger, getStdout } = createLogger();
  const cli = new CLI(pkg, logger, new Map());

  t.is(await cli.run([]), 0);
  t.regex(getStdout(), /Options:/);
});

test('run - help', async (t) => {
  const { logger, getStdout } = createLogger();
  const cli = new CLI(pkg, logger, new Map());

  t.is(await cli.run(['--help']), 0);
  t.regex(getStdout(), /Options:/);
});

test('run - version', async (t) => {
  const { logger, getStdout } = createLogger();
  const cli = new CLI(pkg, logger, new Map());

  t.is(await cli.run(['--version']), 0);
  t.regex(getStdout(), /1\.0\.0/);
});

test('run - verbose', async (t) => {
  const { logger } = createLogger();
  const cli = new CLI(pkg, logger, new Map());

  t.is(await cli.run(['--verbose']), 0);
  t.is(logger.level, LogLevel.Verbose);
});

test('run - command (valid)', async (t) => {
  const { logger, getStdout } = createLogger();
  const cmd = createCommand({
    name: 'cmd',
    key: 'cmd',
    description: '',
    build: (yargs) => yargs,
  })(async ({ logger }) => {
    logger.log('CALL CMD');
    return 1234;
  });

  const cli = new CLI(pkg, logger, new Map([['cmd', cmd]]));

  t.is(await cli.run(['cmd']), 1234);
  t.regex(getStdout(), /CALL\sCMD/);
});

test('run - command (not found)', async (t) => {
  const { logger } = createLogger();
  const cli = new CLI(pkg, logger, new Map());

  t.is(await cli.run(['cmd']), 1);
});
