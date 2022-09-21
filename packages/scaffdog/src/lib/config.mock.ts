// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { ConfigLibrary } from './config';
export const createConfigLibraryMock = (
  mocks: { [P in keyof ConfigLibrary]?: any } = {},
): ConfigLibrary => ({
  load: vi.fn(),
  ...mocks,
});
