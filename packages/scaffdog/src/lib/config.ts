import { loadConfig } from '@scaffdog/config';
import type { ResolvedConfig } from '@scaffdog/types';
import type { Consola } from 'consola';
import type { ErrorLibrary } from './error';

export type ConfigLibrary = {
  load: (cwd: string, project: string) => ResolvedConfig | null;
};

export const createConfigLibrary = (
  logger: Consola,
  error: ErrorLibrary,
): ConfigLibrary => ({
  load: (cwd, project) => {
    try {
      const { filepath, config } = loadConfig(cwd, { project });
      logger.debug('loaded config path: %s', filepath);
      logger.debug('loaded config: %O', config);
      return config;
    } catch (e) {
      error.handle(e, 'Load Config Error');
      return null;
    }
  },
});
