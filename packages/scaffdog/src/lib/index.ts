import type { ConsolaInstance } from 'consola';
import { createConfigLibrary } from './config.js';
import { createDocumentLibrary } from './document.js';
import { createErrorLibrary } from './error.js';
import { createFsLibrary } from './fs.js';
import { createPromptLibrary } from './prompt.js';
import { createQuestionLibrary } from './question.js';

export const createLibrary = (logger: ConsolaInstance) => {
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
