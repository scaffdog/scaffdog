// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { QuestionLibrary } from './question';
export const createQuestionLibraryMock = (
  mocks: { [P in keyof QuestionLibrary]?: any } = {},
): QuestionLibrary => ({
  resolve: vi.fn(),
  ...mocks,
});
