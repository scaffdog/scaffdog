import type { LoadConfigResult } from '@scaffdog/config';
import { loadConfig } from '@scaffdog/config';
import type { Consola } from 'consola';
import type { ErrorLibrary } from './error';

export type ConfigLibrary = {
  load: (project: string) => LoadConfigResult | null;
};

export const createConfigLibrary = (
  logger: Consola,
  error: ErrorLibrary,
): ConfigLibrary => ({
  load: (project) => {
    try {
      const result = loadConfig(project);
      logger.debug('loaded config path: %s', result.filepath);
      logger.debug('loaded config: %O', result.config);
      return result;
    } catch (e) {
      error.handle(e, 'Load Config Error');
      return null;
    }
  },
});
