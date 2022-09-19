// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { FsLibrary } from './fs';
export const createFsLibraryMock = (
  mocks: { [P in keyof FsLibrary]?: any } = {},
): FsLibrary => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  readFileSync: vi.fn(),
  glob: vi.fn(),
  writeFile: vi.fn(),
  fileExists: vi.fn(),
  directoryExists: vi.fn(),
  ...mocks,
});
