// NOTE: This is auto-generated file.
import { vi } from 'vitest';
import type { PromptLibrary } from './prompt';
export const createPromptLibraryMock = (
  mocks: { [P in keyof PromptLibrary]?: any } = {},
): PromptLibrary => ({
  prompt: vi.fn(),
  confirm: vi.fn(),
  autocomplete: vi.fn(),
  ...mocks,
});
