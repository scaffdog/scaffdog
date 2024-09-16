import { createRequire } from 'module';
import { LogLevels, createConsola } from 'consola';
import type { PackageJson } from 'type-fest';
import { createScaffdogInitializer } from './api.js';
import { createLibrary } from './lib/index.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as PackageJson;

/**
 * Export types
 */
export type { LoadConfigResult } from '@scaffdog/config';
export { ScaffdogAggregateError, ScaffdogError } from '@scaffdog/error';
export type {
  Context,
  Config,
  ResolvedConfig,
  Variable,
  VariableRecord,
} from '@scaffdog/types';
export type {
  GenerateInputs,
  GenerateInputsResolver,
  GenerateOptions,
  Scaffdog,
  ScaffdogFactory,
  ScaffdogFactoryOptions,
  ScaffdogLoader,
  ScaffdogLoaderOptions,
} from './api.js';
export type { File } from './file.js';
export type { Document, DocumentAttributes } from './lib/document.js';
export type {
  Question,
  QuestionCheckbox,
  QuestionConfirm,
  QuestionInput,
  QuestionList,
  QuestionMap,
} from './lib/question.js';

/**
 * Export initializer
 */
const logger = createConsola({
  level: LogLevels.silent,
  reporters: [],
});

const lib = createLibrary(logger);

const initializer = createScaffdogInitializer({
  lib,
});

export const version = pkg.version!;
export const createScaffdog = initializer.createScaffdog;
export const loadScaffdog = initializer.loadScaffdog;
