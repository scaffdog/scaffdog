import { createRequire } from 'module';
import consola, { LogLevel } from 'consola';
import type { PackageJson } from 'type-fest';
import { createScaffdogInitializer } from './api';
import { createLibrary } from './lib';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as PackageJson;

/**
 * Export types
 */
export type { LoadConfigResult } from '@scaffdog/config';
export type {
  Context,
  ResolvedConfig,
  VariableRecord,
  Variable,
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
} from './api';
export type { File } from './file';
export type {
  QuestionCheckbox,
  QuestionList,
  QuestionConfirm,
  QuestionInput,
  Question,
  QuestionMap,
} from './lib/question';
export type { Document, DocumentAttributes } from './lib/document';

/**
 * Export initializer
 */
const logger = consola.create({
  level: LogLevel.Silent,
  reporters: [],
});

const lib = createLibrary(logger);

const initializer = createScaffdogInitializer({
  lib,
});

export const version = pkg.version!;
export const createScaffdog = initializer.createScaffdog;
export const loadScaffdog = initializer.loadScaffdog;
