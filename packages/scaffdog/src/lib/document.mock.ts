// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { DocumentLibrary } from './document.js';
export const createDocumentLibraryMock = (
  mocks: { [P in keyof DocumentLibrary]?: any } = {},
): DocumentLibrary => ({
  resolve: vi.fn(),
  ...mocks,
});
