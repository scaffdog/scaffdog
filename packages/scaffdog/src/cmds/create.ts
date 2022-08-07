import path from 'path';
import globby from 'globby';
import validFilename from 'valid-filename';
import { emojify } from 'node-emoji';
import chalk from 'chalk';
import { createCommand } from '../command';
import { autocomplete, prompt } from '../prompt';
import { directoryExists, fileExists, writeFile } from '../utils/fs';

export default createCommand({
  name: 'create',
  key: 'create [name]',
  description: 'Create a document file with the specified name.',
  build: (yargs) =>
    yargs
      .positional('name', {
        type: 'string',
        description: 'Specify a document file name.',
      })
      .options({
        yes: {
          type: 'boolean',
          alias: 'y',
          description: 'Use default options.',
        },
      }),
})(async ({ cwd, logger, options }) => {
  const { project } = options;
  const dirname = path.resolve(cwd, project);
  if (!directoryExists(dirname)) {
    logger.error(
      `"${project}" does not exists. Please use \`$ scaffdog init\` to setup the scaffdog project.`,
    );
    return 1;
  }

  // name
  let name: string;
  if (options.name) {
    if (!validFilename(options.name)) {
      logger.error('Should be a valid filename!');
      return 1;
    }
    name = options.name;
  } else {
    name = await prompt({
      type: 'input',
      message: 'Please enter a filename.',
      validate: (v: string) => {
        if (v === '') {
          return 'required input!';
        }

        if (!validFilename(v)) {
          return 'should be a valid fliename!';
        }

        return true;
      },
      filter: (v: string) => v.trim(),
    });
  }

  const filepath = path.resolve(cwd, project, `${name}.md`);
  if (fileExists(filepath)) {
    logger.error(`"${path.join(cwd, filepath)}" already exists.`);
    return 1;
  }

  // attributes
  const attrs = [`name: '${name}'`];

  const dirs = await globby('.', {
    cwd,
    onlyDirectories: true,
    dot: true,
    unique: true,
    gitignore: true,
  });

  dirs.unshift('.');

  const root = await autocomplete('Please select a root directory.', dirs, {
    default: '.',
    when: !options.yes,
  });

  attrs.push(`root: '${root}'`);

  const output = await prompt({
    type: 'input',
    message: 'Please enter a output pattern.',
    default: '**/*',
    when: !options.yes,
  });

  attrs.push(`output: '${output}'`);
  attrs.push('ignore: []');

  const questions = [`value: 'Please enter any text.'`]
    .map((line) => `  ${line}`)
    .join('\n');

  attrs.push(`questions:\n${questions}`);

  // write
  await writeFile(
    filepath,
    `
---
${attrs.join('\n')}
---

# \`{{ inputs.value }}.md\`

\`\`\`markdown
Let's make a document! See more detail scaffdog repository.
https://github.com/scaffdog/scaffdog/#templates
\`\`\`
`.trim(),
    'utf8',
  );

  // success message
  logger.log('');
  logger.log(
    emojify(
      chalk`
:dog: Created document "{bold ${path.relative(cwd, filepath)}}"
`.trim(),
    ),
  );

  return 0;
});
