import type { Config, Variable } from '@scaffdog/types';
import * as z from 'zod';

const variableSchema: z.ZodSchema<Variable> = z.lazy(() =>
  z.union([z.string(), z.record(variableSchema), z.array(variableSchema)]),
);

const configSchema = z.object({
  files: z.array(z.string()),
  variables: z.record(variableSchema).optional(),
  helpers: z.array(z.function()).optional(),
});

export const validateConfig = (maybeConfig: unknown): Config => {
  return configSchema.parse(maybeConfig);
};
