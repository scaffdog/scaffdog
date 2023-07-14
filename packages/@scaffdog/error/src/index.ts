import { ScaffdogAggregateError } from './scaffdog-aggregate-error.js';
import type { ScaffdogErrorOptions } from './scaffdog-error.js';
import { ScaffdogError } from './scaffdog-error.js';

export { ScaffdogError, ScaffdogErrorOptions, ScaffdogAggregateError };

export const error = (
  message: string,
  options: Partial<ScaffdogErrorOptions> = {},
): ScaffdogError => new ScaffdogError(message, options);
