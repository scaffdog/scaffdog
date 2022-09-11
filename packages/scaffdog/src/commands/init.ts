import path from 'path';
import { extract } from '@scaffdog/core';
import { compile, createContext } from '@scaffdog/engine';
import chalk from 'chalk';
import symbols from 'log-symbols';
import { emojify } from 'node-emoji';
import { createCommand } from '../command';
import type { File } from '../file';
import { confirm, prompt } from '../prompt';
import { directoryExists, mkdir, writeFile } from '../utils/fs';

export default createCommand({
  name: 'init',
  summary:
    'Prepare to use scaffdog. Create a `.scaffdog` directory by default, and create a first document file.',
  args: {},
  flags: {},
})(async ({ cwd, logger, flags }) => {
  const { project } = flags;
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
  const { templates } = extract(
    `
# \`config.js\`

\`\`\`javascript
export default {
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
Let's make a document!
See scaffdog documentation for details.
https://scaff.dog/docs/templates
\`\`\`
\`\`\`\`
`.trim(),
    {},
  );

  const name = await prompt<string>({
    type: 'input',
    message: 'Please enter a document name.',
    validate: (v: string) => (v !== '' ? true : 'required input!'),
  });

  const context = createContext({});
  context.variables.set('name', name);
  context.variables.set('placeholder', `{{ inputs.value }}`);

  const files = await Promise.all(
    templates.map(async (tpl) => {
      const name = compile(tpl.filename, context);
      const file: File = {
        skip: false,
        path: path.resolve(dirname, name),
        name,
        content: compile(tpl.content, context),
      };

      await writeFile(file.path, file.content, 'utf8');

      return file;
    }),
  );

  // success message
  const list = files
    .map((file) => {
      const relative = path.relative(cwd, file.path);
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
{underline https://scaff.dog/docs/templates}
`.trim(),
    ),
  );

  return 0;
});
