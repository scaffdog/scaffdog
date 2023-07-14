// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { ErrorLibrary } from './error.js';
export const createErrorLibraryMock = (
  mocks: { [P in keyof ErrorLibrary]?: any } = {},
): ErrorLibrary => ({
  handle: vi.fn(),
  ...mocks,
});
