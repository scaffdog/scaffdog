import path from 'path';
import chalk from 'chalk';
import symbols from 'log-symbols';
import { generate, extract } from '@scaffdog/core';
import { emojify } from 'node-emoji';
import { createCommand } from '../command';
import { confirm, prompt } from '../prompt';
import { directoryExists, mkdir, writeFile } from '../utils/fs';

export default createCommand({
  name: 'init',
  key: 'init',
  description:
    'Prepare to use scaffdog. Create a `.scaffdog` directory by default, and create a first document file.',
  build: (yargs) => yargs,
})(async ({ cwd, logger, options }) => {
  const { project } = options;
  const dirname = path.resolve(cwd, project);

  // create project directory
  if (directoryExists(dirname)) {
    const ok = await confirm(
      chalk`"{bold.yellow ${project}}" already exist. Do you want to continue the setup?`,
      false,
    );

    if (!ok) {
      logger.warn('Setup canceled!');
      return 1;
    }
  }

  await mkdir(dirname, { recursive: true });

  // create first document file
  const { templates, variables } = extract(
    `
# \`config.js\`

\`\`\`javascript
module.exports = {
  files: ['./*'],
};
\`\`\`

# \`{{ name }}.md\`

\`\`\`\`markdown
---
name: '{{ name }}'
root: '.'
output: '**/*'
ignore: []
questions:
  value: 'Please enter any text.'
---

# \`{{ placeholder }}.md\`

\`\`\`markdown
Let's make a document! See more detail scaffdog repository.
https://github.com/cats-oss/scaffdog/#templates
\`\`\`
\`\`\`\`
`.trim(),
  );

  const name = await prompt<string>({
    type: 'input',
    message: 'Please enter a document name.',
    validate: (v: string) => (v !== '' ? true : 'required input!'),
  });

  variables.set('name', name);
  variables.set('placeholder', `{{ inputs.value }}`);

  const files = generate(templates, variables, {
    cwd,
    root: project,
  });

  await Promise.all(
    files.map(async (file) => {
      await writeFile(file.output, file.content, 'utf8');
    }),
  );

  // success message
  const list = files
    .map((file) => {
      const relative = path.relative(cwd, file.output);
      return chalk`  ${symbols.success} {bold ${relative}}`;
    })
    .join('\n');

  logger.log('');
  logger.log(
    emojify(
      chalk`
Setup of {bold.green scaffdog} :dog: is complete!

${list}

Now you can do scaffold by running \`{green $ scaffdog generate}\`.

Please refer to the following documents and customize it.
{underline https://github.com/cats-oss/scaffdog/#templates}
`.trim(),
    ),
  );

  return 0;
});
