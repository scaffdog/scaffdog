import fs from 'fs';
import path from 'path';
import { defineHelper, extendContext, render } from '@scaffdog/engine';
import type { HelperMap, Variable } from '@scaffdog/types';
import { isPlainObject } from 'is-plain-object';
import { fileExists } from './utils/fs';

const isObjectVariable = (
  input: Variable | undefined,
): input is { [key in string | number]: Variable } => {
  return input != null && isPlainObject(input);
};

export const helpers: HelperMap = new Map();

defineHelper<string[]>(
  helpers,
  'resolve',
  (_, ...args) => path.resolve(...args),
  {
    disableAutoLoop: true,
  },
);

defineHelper<[to: string]>(
  helpers,
  'relative',
  (ctx, to) => {
    const output = ctx.variables.get('output');
    const document = ctx.variables.get('document');
    if (!isObjectVariable(output) || !isObjectVariable(document)) {
      return '';
    }

    if (typeof output.abs !== 'string' || typeof document.path !== 'string') {
      return '';
    }

    return path.relative(
      path.dirname(output.abs),
      path.join(path.dirname(document.path), to),
    );
  },
  {
    disableAutoLoop: true,
  },
);

defineHelper<[target: string]>(
  helpers,
  'read',
  (ctx, target) => {
    const document = ctx.variables.get('document');
    if (!isObjectVariable(document) || typeof document.path !== 'string') {
      throw new Error('"document" is invalid variable.');
    }

    const filepath = path.resolve(path.dirname(document.path), target);
    if (!fileExists(filepath)) {
      throw new Error(`"${filepath}" does not exists.`);
    }

    const content = fs.readFileSync(filepath, 'utf8');

    return render(
      content,
      extendContext(ctx, {
        variables: new Map([
          [
            'document',
            {
              ...document,
              path: filepath,
            },
          ],
        ]),
      }),
    );
  },
  {
    disableAutoLoop: true,
  },
);
