import { loadConfig } from '@scaffdog/config';
import type { ResolvedConfig } from '@scaffdog/types';
import type { Consola } from 'consola';
import type { ErrorLibrary } from './error';

export type ConfigLibrary = {
  load: (project: string) => ResolvedConfig | null;
};

export const createConfigLibrary = (
  logger: Consola,
  error: ErrorLibrary,
): ConfigLibrary => ({
  load: (project) => {
    try {
      const { filepath, config } = loadConfig(project);
      logger.debug('loaded config path: %s', filepath);
      logger.debug('loaded config: %O', config);
      return config;
    } catch (e) {
      error.handle(e, 'Load Config Error');
      return null;
    }
  },
});
