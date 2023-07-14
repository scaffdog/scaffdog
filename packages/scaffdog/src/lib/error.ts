import { ScaffdogAggregateError, ScaffdogError } from '@scaffdog/error';
import chalk from 'chalk';
import type { ConsolaInstance } from 'consola';
import indentString from 'indent-string';
import { z } from 'zod';

const indent = (s: string) => indentString(s, 4);

const format = (e: ScaffdogError | z.ZodError) => {
  if (e instanceof ScaffdogError) {
    return indent(e.format({ color: true }));
  } else if (e instanceof z.ZodError) {
    const msg = [`${e.errors.length} issues found`];
    for (const err of e.errors) {
      const code = err.code.toUpperCase();
      const path = err.path.join('.');
      msg.push(`- ${code}: ${err.message} (in "${path}")`);
    }
    return indent(msg.join('\n'));
  }
  throw new TypeError('Invalid error type');
};

export type ErrorLibrary = {
  handle: (e: unknown, title: string) => number;
};

export const createErrorLibrary = (logger: ConsolaInstance): ErrorLibrary => ({
  handle: (e, title) => {
    if (e instanceof ScaffdogAggregateError) {
      logger.error(title, e.message);
      for (const err of e.errors) {
        if (err instanceof ScaffdogError) {
          logger.log(format(err));
        } else if (err instanceof z.ZodError) {
          logger.log(format(err));
        } else {
          logger.log(indent(chalk.red(e.message)));
        }
        logger.log('');
      }
    } else if (e instanceof ScaffdogError || e instanceof z.ZodError) {
      logger.error(title);
      logger.log(format(e));
    } else if (e instanceof Error) {
      e.message = `${title}: ${e.message}`;
      logger.error(e);
    } else {
      logger.error(title, e);
    }
    logger.log('');
    return 1;
  },
});
