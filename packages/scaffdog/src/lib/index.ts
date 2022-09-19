import type { Consola } from 'consola';
import { createInjector } from 'typed-inject';
import { createDocumentLibrary } from './document';
import { createErrorLibrary } from './error';
import { createFsLibrary } from './fs';
import { createPromptLibrary } from './prompt';
import { createQuestionLibrary } from './question';

export const createLibrary = (logger: Consola) =>
  createInjector()
    .provideValue('logger', logger)
    .provideFactory('fs', createFsLibrary)
    .provideFactory('error', createErrorLibrary)
    .provideFactory('prompt', createPromptLibrary)
    .provideFactory('question', createQuestionLibrary)
    .provideFactory('document', createDocumentLibrary);

export type Library = ReturnType<typeof createLibrary>;
