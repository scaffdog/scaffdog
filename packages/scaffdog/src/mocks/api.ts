import { vi } from 'vitest';
import type { Scaffdog, ScaffdogInitializer } from '../api';
import { createResolvedConfig } from '../lib/config.factory';

export const createScaffdogMock = (
  mocks: Partial<Scaffdog> = {},
): Scaffdog => ({
  path: {
    project: '',
    config: '',
  },
  config: createResolvedConfig(),
  list: vi.fn(),
  generate: vi.fn(),
  ...mocks,
});

export const createScaffdogInitializerMock = (
  mocks: Partial<ScaffdogInitializer> = {},
): ScaffdogInitializer => {
  const scaffdog = createScaffdogMock();

  return {
    createScaffdog: vi.fn().mockReturnValueOnce(scaffdog),
    loadScaffdog: vi.fn().mockResolvedValueOnce(scaffdog),
    ...mocks,
  };
};
