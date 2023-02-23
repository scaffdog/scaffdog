import type { Consola } from 'consola';
import { createConfigLibrary } from './config';
import { createDocumentLibrary } from './document';
import { createErrorLibrary } from './error';
import { createFsLibrary } from './fs';
import { createPromptLibrary } from './prompt';
import { createQuestionLibrary } from './question';

export const createLibrary = (logger: Consola) => {
  const fs = createFsLibrary();
  const error = createErrorLibrary(logger);
  const prompt = createPromptLibrary();
  const config = createConfigLibrary(logger, error);
  const question = createQuestionLibrary(prompt);
  const document = createDocumentLibrary(fs, question);

  return {
    fs,
    error,
    prompt,
    config,
    question,
    document,
  };
};

export type Library = ReturnType<typeof createLibrary>;
