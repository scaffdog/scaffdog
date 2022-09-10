import path from 'path';
import chalk from 'chalk';
import globby from 'globby';
import { emojify } from 'node-emoji';
import validFilename from 'valid-filename';
import { createCommand } from '../command';
import { autocomplete, prompt } from '../prompt';
import { directoryExists, fileExists, writeFile } from '../utils/fs';

export default createCommand({
  name: 'create',
  summary: 'Create a document file with the specified name.',
  args: {
    name: {
      type: 'string',
      description: 'Template document file name.',
    },
  },
  flags: {
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Use default options.',
    },
  },
})(async ({ cwd, logger, args, flags }) => {
  const { project } = flags;
  const dirname = path.resolve(cwd, project);
  if (!directoryExists(dirname)) {
    logger.error(
      `"${project}" does not exists. Please use \`$ scaffdog init\` to setup the scaffdog project.`,
    );
    return 1;
  }

  // name
  let name: string;
  if (args.name) {
    if (!validFilename(args.name)) {
      logger.error('Should be a valid filename!');
      return 1;
    }
    name = args.name;
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
    when: !flags.yes,
  });

  attrs.push(`root: '${root}'`);

  const output = await prompt({
    type: 'input',
    message: 'Please enter a output pattern.',
    default: '**/*',
    when: !flags.yes,
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
Let's make a document!
See scaffdog documentation for details.
https://scaff.dog/docs/templates
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
