/// <reference types="../types/inquirer-autocomplete-prompt" />
import path from 'path';
import { loadConfig } from '@scaffdog/config';
import {
  compile,
  createContext,
  createHelper,
  extendContext,
  render,
} from '@scaffdog/engine';
import { ScaffdogError } from '@scaffdog/error';
import type { Context, Variable, VariableRecord } from '@scaffdog/types';
import ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import type { Consola } from 'consola';
import globby from 'globby';
import indent from 'indent-string';
import symbols from 'log-symbols';
import micromatch from 'micromatch';
import { emojify } from 'node-emoji';
import plur from 'plur';
import { createCommand } from '../command';
import type { Document, Question } from '../document';
import { resolveDocuments } from '../document';
import type { File } from '../file';
import { helpers } from '../helpers';
import type { PromptQuestion } from '../prompt';
import { autocomplete, confirm, prompt } from '../prompt';
import { formatFile } from '../utils/format';
import { fileExists, mkdir, writeFile } from '../utils/fs';
import { assignGlobalVariables, createTemplateVariables } from '../variables';

const handleCompileError = (e: unknown, logger: Consola): number => {
  if (e instanceof ScaffdogError) {
    logger.error('Compile error');
    logger.log(indent(e.format({ color: true }), 4));
    logger.log('');
  } else {
    logger.error(e);
  }
  return 1;
};

const questionIf = createHelper<[any]>((_, result) => {
  if (typeof result === 'boolean') {
    return result ? 'true' : 'false';
  }
  throw new Error(
    'evaluation value of "question.*.if" must be a boolean value',
  );
});

const confirmQuestionIf = (question: Question, context: Context) => {
  if (typeof question === 'string') {
    return true;
  }

  if ('if' in question && question.if != null) {
    if (typeof question.if === 'boolean') {
      return question.if;
    }

    const fn = '__internal_question_if__';
    const ctx = extendContext(context, {
      helpers: new Map([[fn, questionIf]]),
    });

    return render(`{{ ${fn}(${question.if}) }}`, ctx) === 'true';
  }

  return true;
};

const createPromptQuestion = (question: Question): PromptQuestion => {
  const validate = (v: string) => (v !== '' ? true : 'required input!');

  if (typeof question === 'string') {
    return {
      type: 'input',
      message: question,
      validate,
    };
  }

  if ('confirm' in question) {
    return {
      type: 'confirm',
      message: question.confirm,
      default: question.initial,
      validate,
    };
  }

  if ('choices' in question) {
    return {
      type: question.multiple === true ? 'checkbox' : 'list',
      choices: question.choices,
      default: question.initial,
      validate,
    };
  }

  return {
    ...question,
    type: 'input',
    default: question.initial,
  };
};

const questionFallbackValue = (question: Question): Variable => {
  if (typeof question === 'string') {
    return '';
  }

  if ('confirm' in question) {
    return question.initial ?? false;
  }

  if ('choices' in question) {
    return question.multiple ? question.initial ?? [] : question.initial ?? '';
  }

  return question.initial ?? '';
};

export default createCommand({
  name: 'generate',
  summary:
    'Build a scaffold using the specified template. If you do not specify the template name and execute it, interactively select the template.',
  args: {
    name: {
      type: 'string',
      description: 'Template document name.',
    },
  },
  flags: {
    'dry-run': {
      type: 'boolean',
      alias: 'n',
      description: 'Output the result to stdout.',
    },
    force: {
      type: 'boolean',
      alias: 'f',
      default: false,
      description:
        'Attempt to write the files without prompting for confirmation.',
    },
  },
})(async ({ cwd, logger, size, args, flags }) => {
  // configuration
  const { project } = flags;
  const config = loadConfig(cwd, { project });
  logger.debug('load config: %O', config);

  const dirname = path.resolve(cwd, project);

  // base context
  const context = createContext({
    cwd,
    variables: config.variables,
    helpers: new Map([...config.helpers, ...helpers]),
    tags: config.tags,
  });

  // clear
  if (!flags.verbose) {
    logger.log(ansiEscapes.clearScreen);
  }

  // resolve document
  let documents: Document[];
  try {
    documents = await resolveDocuments(dirname, config.files, {
      tags: context.tags,
    });
  } catch (e) {
    return handleCompileError(e, logger);
  }

  if (documents.length === 0) {
    logger.error(
      'Document file not found. Please use `$ scaffdog create <name>` to create the document file.',
    );
    return 1;
  }

  const name =
    args.name == null
      ? await prompt({
          type: 'list',
          message: 'Please select a document.',
          choices: documents.map((d) => d.name),
        })
      : args.name;

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

  // set variables
  assignGlobalVariables(context, {
    cwd,
    document: doc,
  });

  // inputs
  if (doc.questions != null) {
    const inputs: VariableRecord = Object.create(null);

    for (const [name, q] of Object.entries(doc.questions)) {
      const ctx = extendContext(context, {
        variables: new Map([['inputs', inputs]]),
      });

      try {
        if (confirmQuestionIf(q, ctx)) {
          inputs[name] = await prompt<Variable>(createPromptQuestion(q));
        } else {
          inputs[name] = questionFallbackValue(q);
        }
      } catch (e) {
        return handleCompileError(e, logger);
      }
    }

    context.variables.set('inputs', inputs);
  } else {
    context.variables.set('inputs', {});
  }

  logger.debug('variables: %O', context.variables);

  // generate
  const files: File[] = [];
  try {
    for (const [key, ast] of doc.variables) {
      context.variables.set(key, compile(ast, context));
    }

    for (const tpl of doc.templates) {
      const filename = compile(tpl.filename, context);
      if (/^!/.test(filename)) {
        const name = filename.slice(1);
        files.push({
          skip: true,
          path: path.resolve(cwd, dist, name),
          name,
          content: '',
        });
        continue;
      }

      const ctx = extendContext(context, {
        variables: createTemplateVariables({
          cwd,
          root: dist,
          name: filename,
        }),
      });

      files.push({
        skip: false,
        path: path.resolve(cwd, dist, filename),
        name: filename,
        content: compile(tpl.content, ctx),
      });
    }
  } catch (e) {
    return handleCompileError(e, logger);
  }

  logger.debug('files: %O', files);

  const writes: Set<File> = new Set();
  const skips: Set<File> = new Set();

  if (flags['dry-run']) {
    files.forEach((file) => {
      if (!file.skip) {
        logger.log('');
        logger.log(
          formatFile(file, {
            columns: size.columns,
            color: true,
          }),
        );
      }

      if (file.skip) {
        skips.add(file);
      } else {
        writes.add(file);
      }
    });
  } else {
    for (const file of files) {
      if (file.skip) {
        skips.add(file);
        continue;
      }

      await mkdir(path.dirname(file.path), { recursive: true });

      if (!flags.force && fileExists(file.path)) {
        const relative = path.relative(cwd, file.path);

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

      await writeFile(file.path, file.content, 'utf8');

      writes.add(file);
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
    const relative = path.relative(cwd, file.path);
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
