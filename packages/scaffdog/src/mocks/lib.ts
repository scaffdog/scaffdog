import { createInjector } from 'typed-inject';
import type { Library } from '../lib';
import { createDocumentLibraryMock } from '../lib/document.mock';
import { createErrorLibraryMock } from '../lib/error.mock';
import { createFsLibraryMock } from '../lib/fs.mock';
import { createPromptLibraryMock } from '../lib/prompt.mock';
import { createQuestionLibraryMock } from '../lib/question.mock';
import { createLogger } from './logger';

export const createLibraryMock = (): Library => {
  const { logger } = createLogger();

  return createInjector()
    .provideValue('logger', logger)
    .provideValue('fs', createFsLibraryMock())
    .provideValue('error', createErrorLibraryMock())
    .provideValue('prompt', createPromptLibraryMock())
    .provideValue('question', createQuestionLibraryMock())
    .provideValue('document', createDocumentLibraryMock());
};
