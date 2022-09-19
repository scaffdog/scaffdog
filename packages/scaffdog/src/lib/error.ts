import { ScaffdogError } from '@scaffdog/error';
import type { Consola } from 'consola';
import indent from 'indent-string';
import { z } from 'zod';

export type ErrorLibrary = {
  handle: (e: unknown, title: string) => number;
};

export const createErrorLibrary = (logger: Consola): ErrorLibrary => ({
  handle: (e, title) => {
    if (e instanceof ScaffdogError) {
      logger.error(title);
      logger.log(indent(e.format({ color: true }), 4));
    } else if (e instanceof z.ZodError) {
      const msg = [`${e.errors.length} issues found`];
      for (const err of e.errors) {
        const code = err.code.toUpperCase();
        const path = err.path.join('.');
        msg.push(`- ${code}: ${err.message} (in "${path}")`);
      }
      logger.error(title);
      logger.log(indent(msg.join('\n'), 4));
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

createErrorLibrary.inject = ['logger'] as const;
