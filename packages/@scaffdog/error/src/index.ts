import { ScaffdogAggregateError } from './scaffdog-aggregate-error';
import type { ScaffdogErrorOptions } from './scaffdog-error';
import { ScaffdogError } from './scaffdog-error';

export { ScaffdogError, ScaffdogErrorOptions, ScaffdogAggregateError };

export const error = (
  message: string,
  options: Partial<ScaffdogErrorOptions> = {},
): ScaffdogError => new ScaffdogError(message, options);
