/// <reference types="../types/inquirer-autocomplete-prompt" />
import path from 'path';
import type { File } from '@scaffdog/types';
import { loadConfig } from '@scaffdog/config';
import { generate } from '@scaffdog/core';
import { ScaffdogError } from '@scaffdog/error';
import globby from 'globby';
import ansiEscapes from 'ansi-escapes';
import micromatch from 'micromatch';
import chalk from 'chalk';
import symbols from 'log-symbols';
import { emojify } from 'node-emoji';
import indent from 'indent-string';
import plur from 'plur';
import { compile, createContext } from '@scaffdog/engine';
import { createCommand } from '../command';
import { resolveDocuments } from '../document';
import { formatFile } from '../utils/format';
import { autocomplete, confirm, prompt } from '../prompt';
import { fileExists, mkdir, writeFile } from '../utils/fs';
import { helpers } from '../helpers';

export default createCommand({
  name: 'generate',
  key: 'generate [name]',
  description:
    'Build a scaffold using the specified template. If you do not specify the template name and execute it, interactively select the template.',
  build: (yargs) =>
    yargs
      .positional('name', {
        type: 'string',
      })
      .options({
        'dry-run': {
          type: 'boolean',
          alias: 'n',
          description: 'Output the result to stdout.',
        },
      }),
})(async ({ cwd, size, logger, options }) => {
  // configuration
  const { project } = options;
  const config = loadConfig(cwd, { project });
  logger.debug('load config: %O', config);

  const dirname = path.resolve(cwd, project);
  const documents = await resolveDocuments(dirname, config.files);
  if (documents.length === 0) {
    logger.error(
      'Document file not found. Please use `$ scaffdog create <name>` to create the document file.',
    );
    return 1;
  }

  // clear
  if (!options.verbose) {
    logger.log(ansiEscapes.clearScreen);
  }

  // resolve document
  let name: string;
  if (options.name == null) {
    name = await prompt({
      type: 'list',
      message: 'Please select a document.',
      choices: documents.map((d) => d.name),
    });
  } else {
    name = options.name;
  }

  logger.debug('using name: %s', name);

  const doc = documents.find((d) => d.name === name);
  if (doc == null) {
    logger.error(`Document "${name}" not found.`);
    return 1;
  }

  logger.debug('found document: %O', doc);

  // dist
  const directories = new Set([doc.root]);
  const output = typeof doc.output === 'string' ? [doc.output] : doc.output;

  for (const pattern of output) {
    if (globby.hasMagic(pattern)) {
      const found = await globby(path.join(doc.root, pattern), {
        cwd,
        onlyDirectories: true,
        dot: true,
        unique: true,
        gitignore: true,
      });

      found.forEach((dir) => {
        directories.add(dir);
      });
    } else {
      directories.add(path.join(doc.root, pattern));
    }
  }

  let dirs = Array.from(directories);

  logger.debug('found directories: %O', dirs);

  if (doc.ignore != null && doc.ignore.length > 0) {
    dirs = micromatch.not(dirs, doc.ignore);
    logger.debug('filtered directories: %O', dirs);
  }

  let dist: string;
  if (dirs.length > 1) {
    dist = await autocomplete(
      'Please select the output destination directory.',
      dirs,
    );
  } else {
    dist = dirs[0];
    logger.info(chalk`Output destination directory: "{bold.green ${dist}}"`);
  }

  logger.debug('selected dist: %s', dist);
  dist = path.resolve(cwd, dist);
  logger.debug('normalized dist: %s', dist);

  // inputs
  if (doc.questions != null) {
    const inputs: Record<string, string> = {};

    for (const [name, q] of Object.entries(doc.questions)) {
      const obj =
        typeof q === 'string'
          ? {
              message: q,
            }
          : q;

      const question = {
        message: obj.message,
        default: obj.initial,
        validate: (v: string) => (v !== '' ? true : 'required input!'),
      };

      inputs[name] = await prompt(
        obj.choices != null
          ? {
              ...question,
              type: 'list',
              choices: obj.choices,
            }
          : {
              ...question,
              type: 'input',
            },
      );
    }

    config.variables.set('inputs', inputs);
  } else {
    config.variables.set('inputs', {});
  }

  config.variables.set('cwd', cwd);

  config.variables.set('document', {
    path: doc.path,
    name: doc.name,
  });

  logger.debug('variables: %O', config.variables);

  // generate
  let files: File[];
  try {
    const context = createContext({
      cwd,
      variables: config.variables,
      helpers: new Map([...config.helpers, ...helpers]),
      tags: config.tags,
    });

    for (const [key, value] of doc.variables) {
      config.variables.set(key, compile(value, context));
    }

    files = generate(doc.templates, config.variables, {
      cwd,
      root: dist,
      helpers: context.helpers,
      tags: context.tags,
    });
  } catch (e) {
    if (e instanceof ScaffdogError) {
      logger.error('Compile error');
      logger.log(indent(e.format({ color: true }), 4));
      logger.log('');
      return 1;
    } else {
      logger.error(e);
      return 1;
    }
  }

  logger.debug('files: %O', files);

  const writes: Set<File> = new Set();
  const skips: Set<File> = new Set();

  if (options['dry-run']) {
    files.forEach((file) => {
      logger.log('');
      logger.log(
        formatFile(file, {
          columns: size.columns,
          color: true,
        }),
      );

      writes.add(file);
    });
  } else {
    for (const file of files) {
      try {
        await mkdir(path.dirname(file.output), { recursive: true });

        if (fileExists(file.output)) {
          const relative = path.relative(cwd, file.output);

          const ok = await confirm(
            chalk`Would you like to overwrite it? ("{bold.yellow ${relative}}")`,
            false,
            {
              prefix: symbols.warning,
            },
          );

          if (!ok) {
            skips.add(file);
            continue;
          }
        }

        await writeFile(file.output, file.content, 'utf8');

        writes.add(file);
      } catch (e) {
        logger.error(e);
        return 1;
      }
    }
  }

  const msg = {
    write: chalk.bold.green(`${writes.size} ${plur('file', writes.size)}`),
    skip: skips.size > 0 ? chalk.bold.gray(` (${skips.size} skipped)`) : '',
  };

  logger.log('');
  logger.log(emojify(chalk`:dog: Generated ${msg.write}!${msg.skip}`));
  logger.log('');

  [...writes, ...skips].forEach((file) => {
    const skipped = skips.has(file);
    const prefix = ' '.repeat(4);
    const relative = path.relative(cwd, file.output);
    const output = [
      prefix,
      skipped ? symbols.warning : symbols.success,
      skipped ? relative : chalk.bold(relative),
    ];

    if (skipped) {
      output.push(chalk.gray('(skipped)'));
    }

    logger.log(output.join(' '));
  });

  return 0;
});
