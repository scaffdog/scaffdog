import type { Library } from '../lib';
import { createDocumentLibraryMock } from '../lib/document.mock';
import { createErrorLibraryMock } from '../lib/error.mock';
import { createFsLibraryMock } from '../lib/fs.mock';
import { createPromptLibraryMock } from '../lib/prompt.mock';
import { createQuestionLibraryMock } from '../lib/question.mock';

export const createLibraryMock = (mocks: Partial<Library> = {}): Library => {
  return {
    fs: createFsLibraryMock(),
    error: createErrorLibraryMock(),
    prompt: createPromptLibraryMock(),
    question: createQuestionLibraryMock(),
    document: createDocumentLibraryMock(),
    ...mocks,
  };
};
